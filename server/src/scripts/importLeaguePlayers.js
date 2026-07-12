import "dotenv/config"
import { footballApiRequest } from "../lib/footballApi.js"
import { prisma } from "../lib/prisma.js"
import {
  createSeasonLabel,
  mapPosition,
  normalizeText,
  parseBirthDate,
  parseRating,
} from "../utils/footballData.js"

const leagueId = Number(process.argv[2])
const seasonYear = Number(process.argv[3])

if (!Number.isInteger(leagueId) || !Number.isInteger(seasonYear)) {
  console.error(
    "Usage: npm run import:players -- <leagueId> <seasonYear>",
  )
  process.exit(1)
}

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

async function importLeaguePlayers() {
  console.log(
    `Starting player import for league ${leagueId}, season ${seasonYear}`,
  )

  const leagueData = await footballApiRequest("/leagues", {
    id: leagueId,
    season: seasonYear,
  })

  const leagueResponse = leagueData.response?.[0]

  if (!leagueResponse) {
    throw new Error("League or season was not found in API-Football")
  }

  const competition = await prisma.competition.upsert({
    where: {
      apiId: leagueResponse.league.id,
    },
    update: {
      name: leagueResponse.league.name,
      country: leagueResponse.country?.name ?? null,
      type: leagueResponse.league.type ?? null,
      logoUrl: leagueResponse.league.logo ?? null,
    },
    create: {
      apiId: leagueResponse.league.id,
      name: leagueResponse.league.name,
      country: leagueResponse.country?.name ?? null,
      type: leagueResponse.league.type ?? null,
      logoUrl: leagueResponse.league.logo ?? null,
    },
  })

  const season = await prisma.season.upsert({
    where: {
      label: createSeasonLabel(seasonYear),
    },
    update: {
      startYear: seasonYear,
    },
    create: {
      startYear: seasonYear,
      label: createSeasonLabel(seasonYear),
    },
  })

  let currentPage = 1
  let totalPages = 1
  let importedStatistics = 0

  do {
    console.log(`Downloading page ${currentPage} of ${totalPages}`)

    const data = await footballApiRequest("/players", {
      league: leagueId,
      season: seasonYear,
      page: currentPage,
    })

    totalPages = data.paging?.total ?? 1

    for (const item of data.response ?? []) {
      const apiPlayer = item.player

      if (!apiPlayer?.id || !apiPlayer?.name) {
        continue
      }

      const player = await prisma.player.upsert({
        where: {
          apiId: apiPlayer.id,
        },
        update: {
          name: apiPlayer.name,
          normalizedName: normalizeText(apiPlayer.name),
          firstName: apiPlayer.firstname ?? null,
          lastName: apiPlayer.lastname ?? null,
          nationality: apiPlayer.nationality ?? null,
          birthDate: parseBirthDate(apiPlayer.birth?.date),
          height: apiPlayer.height ?? null,
          weight: apiPlayer.weight ?? null,
          photoUrl: apiPlayer.photo ?? null,
        },
        create: {
          apiId: apiPlayer.id,
          name: apiPlayer.name,
          normalizedName: normalizeText(apiPlayer.name),
          firstName: apiPlayer.firstname ?? null,
          lastName: apiPlayer.lastname ?? null,
          nationality: apiPlayer.nationality ?? null,
          birthDate: parseBirthDate(apiPlayer.birth?.date),
          height: apiPlayer.height ?? null,
          weight: apiPlayer.weight ?? null,
          photoUrl: apiPlayer.photo ?? null,
        },
      })

      for (const statistics of item.statistics ?? []) {
        if (statistics.league?.id !== leagueId) {
          continue
        }

        const apiTeam = statistics.team

        if (!apiTeam?.id || !apiTeam?.name) {
          continue
        }

        const club = await prisma.club.upsert({
          where: {
            apiId: apiTeam.id,
          },
          update: {
            name: apiTeam.name,
            logoUrl: apiTeam.logo ?? null,
          },
          create: {
            apiId: apiTeam.id,
            name: apiTeam.name,
            logoUrl: apiTeam.logo ?? null,
          },
        })

        await prisma.playerSeason.upsert({
          where: {
            playerId_clubId_competitionId_seasonId: {
              playerId: player.id,
              clubId: club.id,
              competitionId: competition.id,
              seasonId: season.id,
            },
          },
          update: {
            position: mapPosition(statistics.games?.position),
            appearances: statistics.games?.appearences ?? 0,
            starts: statistics.games?.lineups ?? 0,
            minutes: statistics.games?.minutes ?? 0,
            goals: statistics.goals?.total ?? 0,
            assists: statistics.goals?.assists ?? 0,
            yellowCards: statistics.cards?.yellow ?? 0,
            redCards:
              (statistics.cards?.red ?? 0) +
              (statistics.cards?.yellowred ?? 0),
            cleanSheets: 0,
            rating: parseRating(statistics.games?.rating),
          },
          create: {
            playerId: player.id,
            clubId: club.id,
            competitionId: competition.id,
            seasonId: season.id,
            position: mapPosition(statistics.games?.position),
            appearances: statistics.games?.appearences ?? 0,
            starts: statistics.games?.lineups ?? 0,
            minutes: statistics.games?.minutes ?? 0,
            goals: statistics.goals?.total ?? 0,
            assists: statistics.goals?.assists ?? 0,
            yellowCards: statistics.cards?.yellow ?? 0,
            redCards:
              (statistics.cards?.red ?? 0) +
              (statistics.cards?.yellowred ?? 0),
            cleanSheets: 0,
            rating: parseRating(statistics.games?.rating),
          },
        })

        importedStatistics += 1
      }
    }

    currentPage += 1

    if (currentPage <= totalPages) {
      await delay(6500)
    }
  } while (currentPage <= totalPages)

  console.log("Import completed")
  console.log(`Player-season records processed: ${importedStatistics}`)
}

importLeaguePlayers()
  .catch((error) => {
    console.error("Import failed")
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })