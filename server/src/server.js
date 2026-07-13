import "dotenv/config"
import express from "express"
import cors from "cors"
import { prisma } from "./lib/prisma.js"
import { footballApiRequest } from "./lib/footballApi.js"
import playersRouter from "./routes/players.js"

const app = express()
const PORT = process.env.PORT || 4000

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
)

app.use(express.json())

app.use("/api/players", playersRouter)

app.get("/api/health", async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`

    res.json({
      status: "ok",
      message: "Football Stat Game API is running",
      database: "connected",
    })
  } catch (error) {
    next(error)
  }
})

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  })
})

app.use((error, req, res, next) => {
  console.error(error)

  res.status(500).json({
    error: error.message || "Internal server error",
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})