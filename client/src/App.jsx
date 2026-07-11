import Header from "./components/Header"
import ScorePanel from "./components/ScorePanel"
import GameSlot from "./components/GameSlot"

const gameSlots = [
  {
    id: 1,
    club: "FC Barcelona",
    period: "2015/16–2022/23",
    position: "Forward",
    scoreCategory: "Goals",
  },
  {
    id: 2,
    club: "Manchester City",
    period: "2018/19–2024/25",
    position: "Midfielder",
    scoreCategory: "Assists",
  },
  {
    id: 3,
    club: "Bayern Munich",
    period: "2012/13–2021/22",
    position: "Forward",
    scoreCategory: "Goals",
  },
  {
    id: 4,
    club: "Real Madrid",
    period: "2014/15–2023/24",
    position: "Defender",
    scoreCategory: "Appearances",
  },
  {
    id: 5,
    club: "Liverpool",
    period: "2017/18–2024/25",
    position: "Goalkeeper",
    scoreCategory: "Clean sheets",
  },
]

function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <section className="mb-8">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-500">
              Today&apos;s category
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
              Goals
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base">
              Select one valid footballer and season for every row. Your score
              is based on the number of goals recorded in the selected season.
            </p>
          </div>

          <ScorePanel />
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
              5 guesses remaining
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
              />
            ))}
          </div>
        </section>

        <footer className="py-10 text-center text-sm text-neutral-600">
          Football Stat Game — development prototype
        </footer>
      </main>
    </div>
  )
}

export default App