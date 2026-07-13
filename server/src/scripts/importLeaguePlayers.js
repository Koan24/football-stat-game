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
  console.error("Usage: npm run import:players -- <leagueId> <seasonYear>")
  process.exit(1)
}

const REQUEST_DELAY_MS = 6500

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

async function savePlayerStatistics({
  item,
  leagueId,
  competition,
  season,
  expectedTeamId,
}) {
  const apiPlayer = item.player

  if (!apiPlayer?.id || !apiPlayer?.name) {
    return 0
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

  let processedRecords = 0

  for (const statistics of item.statistics ?? []) {
    if (
      statistics.league?.id !== leagueId ||
      statistics.team?.id !== expectedTeamId
    ) {
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

    const playerSeasonData = {
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
    }

    await prisma.playerSeason.upsert({
      where: {
        playerId_clubId_competitionId_seasonId: {
          playerId: player.id,
          clubId: club.id,
          competitionId: competition.id,
          seasonId: season.id,
        },
      },
      update: playerSeasonData,
      create: {
        playerId: player.id,
        clubId: club.id,
        competitionId: competition.id,
        seasonId: season.id,
        ...playerSeasonData,
      },
    })

    processedRecords += 1
  }

  return processedRecords
}

async function importTeamPlayers({
  team,
  leagueId,
  seasonYear,
  competition,
  season,
}) {
  let currentPage = 1
  let totalPages = 1
  let processedRecords = 0
  let isComplete = true

  do {
    console.log(`${team.name}: downloading page ${currentPage}`)

    const data = await footballApiRequest("/players", {
      team: team.id,
      league: leagueId,
      season: seasonYear,
      page: currentPage,
    })

    const apiTotalPages = Number(data.paging?.total ?? 1)

    if (apiTotalPages > 3) {
      isComplete = false

      if (currentPage === 1) {
        console.warn(
          `${team.name}: API reports ${apiTotalPages} pages. ` +
            "The free plan permits only pages 1-3, so this team will be imported partially.",
        )
      }
    }

    totalPages = Math.min(apiTotalPages, 3)

    for (const item of data.response ?? []) {
      processedRecords += await savePlayerStatistics({
        item,
        leagueId,
        competition,
        season,
        expectedTeamId: team.id,
      })
    }

    currentPage += 1

    if (currentPage <= totalPages) {
      await delay(REQUEST_DELAY_MS)
    }
  } while (currentPage <= totalPages)

  return {
    processedRecords,
    isComplete,
  }
}

async function importLeaguePlayers() {
  console.log(
    `Starting team-based import for league ${leagueId}, season ${seasonYear}`,
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

  const teamsData = await footballApiRequest("/teams", {
    league: leagueId,
    season: seasonYear,
  })

  const teams = (teamsData.response ?? [])
    .map((item) => item.team)
    .filter((team) => team?.id && team?.name)

  if (teams.length === 0) {
    throw new Error("No teams were returned for this league and season")
  }

  console.log(`Teams found: ${teams.length}`)

  let importedStatistics = 0
  const incompleteTeams = []

  for (const [index, team] of teams.entries()) {
    if (index > 0) {
      await delay(REQUEST_DELAY_MS)
    }

    console.log(`Importing ${index + 1}/${teams.length}: ${team.name}`)

    const club = await prisma.club.upsert({
      where: {
        apiId: team.id,
      },
      update: {
        name: team.name,
        country: leagueResponse.country?.name ?? null,
        logoUrl: team.logo ?? null,
      },
      create: {
        apiId: team.id,
        name: team.name,
        country: leagueResponse.country?.name ?? null,
        logoUrl: team.logo ?? null,
      },
    })

    void club

    const teamImportResult = await importTeamPlayers({
      team,
      leagueId,
      seasonYear,
      competition,
      season,
    })

    importedStatistics += teamImportResult.processedRecords

    if (!teamImportResult.isComplete) {
      incompleteTeams.push(team.name)
    }
  }

  console.log("Import completed")
  console.log(`Player-season records processed: ${importedStatistics}`)

  if (incompleteTeams.length > 0) {
    console.warn(
      `Partially imported teams (${incompleteTeams.length}): ` +
        incompleteTeams.join(", "),
    )
  }
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