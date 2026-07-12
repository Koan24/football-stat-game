import { useMemo, useState } from "react"
import Header from "./components/Header"
import ScorePanel from "./components/ScorePanel"
import GameSlot from "./components/GameSlot"
import PlayerModal from "./components/PlayerModal"
import { validatePlayerSelection } from "./utils/validation"

const gameSlots = [
  {
    id: 1,
    club: "FC Barcelona",
    period: "2015/16–2022/23",
    seasonFrom: 2015,
    seasonTo: 2022,
    position: "Forward",
    scoreCategory: "Goals",
    scoreMetric: "goals",
  },
  {
    id: 2,
    club: "Manchester City",
    period: "2018/19–2024/25",
    seasonFrom: 2018,
    seasonTo: 2024,
    position: "Midfielder",
    scoreCategory: "Assists",
    scoreMetric: "assists",
  },
  {
    id: 3,
    club: "Bayern Munich",
    period: "2012/13–2021/22",
    seasonFrom: 2012,
    seasonTo: 2021,
    position: "Forward",
    scoreCategory: "Goals",
    scoreMetric: "goals",
  },
  {
    id: 4,
    club: "Real Madrid",
    period: "2014/15–2023/24",
    seasonFrom: 2014,
    seasonTo: 2023,
    position: "Defender",
    scoreCategory: "Appearances",
    scoreMetric: "appearances",
  },
  {
    id: 5,
    club: "Liverpool",
    period: "2017/18–2024/25",
    seasonFrom: 2017,
    seasonTo: 2024,
    position: "Goalkeeper",
    scoreCategory: "Appearances",
    scoreMetric: "appearances",
  },
]

function App() {
  const [activeSlot, setActiveSlot] = useState(null)
  const [selections, setSelections] = useState({})

  const selectedCount = Object.keys(selections).length

  const totalScore = useMemo(() => {
    return Object.values(selections).reduce(
      (sum, selection) => sum + selection.score,
      0,
    )
  }, [selections])

  const handleConfirmSelection = ({ player, season }) => {
    if (!activeSlot) {
      return ["Nie znaleziono aktywnego pola gry."]
    }

    const validationErrors = validatePlayerSelection({
      slot: activeSlot,
      player,
      season,
      selections,
    })

    if (validationErrors.length > 0) {
      return validationErrors
    }

    const score = Number(season[activeSlot.scoreMetric] ?? 0)

    setSelections((currentSelections) => ({
      ...currentSelections,
      [activeSlot.id]: {
        player,
        season,
        score,
      },
    }))

    setActiveSlot(null)

    return []
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <section className="mb-8">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-500">
              Today&apos;s challenge
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
              Mixed statistics
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base">
              Select one footballer and season for every row. Each row uses its
              own scoring statistic.
            </p>
          </div>

          <ScorePanel
            totalScore={totalScore}
            selectedCount={selectedCount}
          />
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Player selections</h2>

              <p className="mt-1 text-sm text-neutral-500">
                Each footballer may only be used once.
              </p>
            </div>

            <span className="text-sm font-medium text-neutral-500">
              {5 - selectedCount} guesses remaining
            </span>
          </div>

          <div className="space-y-4">
            {gameSlots.map((slot) => (
              <GameSlot
                key={slot.id}
                number={slot.id}
                club={slot.club}
                period={slot.period}
                position={slot.position}
                scoreCategory={slot.scoreCategory}
                selection={selections[slot.id]}
                onSelect={() => setActiveSlot(slot)}
              />
            ))}
          </div>
        </section>

        <footer className="py-10 text-center text-sm text-neutral-600">
          Football Stat Game — development prototype
        </footer>
      </main>

      <PlayerModal
        isOpen={Boolean(activeSlot)}
        slot={activeSlot}
        selections={selections}
        currentSelection={
          activeSlot ? selections[activeSlot.id] ?? null : null
        }
        onClose={() => setActiveSlot(null)}
        onConfirm={handleConfirmSelection}
      />
    </div>
  )
}

export default App