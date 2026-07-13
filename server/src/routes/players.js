import express from "express"
import { prisma } from "../lib/prisma.js"
import { normalizeText } from "../utils/footballData.js"

const router = express.Router()

router.get("/search", async (req, res, next) => {
  try {
    const rawQuery = typeof req.query.q === "string" ? req.query.q : ""
    const query = normalizeText(rawQuery)

    if (query.length < 2) {
      return res.status(400).json({
        error: "Search query must contain at least 2 characters",
      })
    }

    const players = await prisma.player.findMany({
      where: {
        normalizedName: {
          contains: query,
        },
      },
      select: {
        id: true,
        name: true,
        nationality: true,
        photoUrl: true,
        statistics: {
          select: {
            position: true,
          },
          take: 1,
          orderBy: {
            season: {
              startYear: "desc",
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      take: 10,
    })

    const response = players.map((player) => ({
      id: player.id,
      name: player.name,
      nationality: player.nationality,
      photoUrl: player.photoUrl,
      position: player.statistics[0]?.position ?? "UNKNOWN",
    }))

    res.json(response)
  } catch (error) {
    next(error)
  }
})

router.get("/:id/seasons", async (req, res, next) => {
  try {
    const playerId = Number(req.params.id)

    if (!Number.isInteger(playerId)) {
      return res.status(400).json({
        error: "Invalid player id",
      })
    }

    const player = await prisma.player.findUnique({
      where: {
        id: playerId,
      },
      select: {
        id: true,
        name: true,
        nationality: true,
        photoUrl: true,
        statistics: {
          select: {
            id: true,
            position: true,
            appearances: true,
            starts: true,
            minutes: true,
            goals: true,
            assists: true,
            yellowCards: true,
            redCards: true,
            cleanSheets: true,
            rating: true,
            club: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
            competition: {
              select: {
                id: true,
                name: true,
                country: true,
              },
            },
            season: {
              select: {
                id: true,
                label: true,
                startYear: true,
              },
            },
          },
          orderBy: {
            season: {
              startYear: "desc",
            },
          },
        },
      },
    })

    if (!player) {
      return res.status(404).json({
        error: "Player not found",
      })
    }

    res.json(player)
  } catch (error) {
    next(error)
  }
})

export default router