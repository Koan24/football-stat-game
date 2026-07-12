import { useEffect, useMemo, useState } from "react"
import { players } from "../data/players"

function PlayerModal({ isOpen, slot, onClose, onConfirm }) {
  const [search, setSearch] = useState("")
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [selectedSeasonId, setSelectedSeasonId] = useState("")

  useEffect(() => {
    if (isOpen) {
      setSearch("")
      setSelectedPlayer(null)
      setSelectedSeasonId("")
    }
  }, [isOpen])

  const filteredPlayers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return players
    }

    return players.filter((player) =>
      player.name.toLowerCase().includes(normalizedSearch),
    )
  }, [search])

  const selectedSeason = selectedPlayer?.seasons.find(
    (season) => season.id === Number(selectedSeasonId),
  )

  const handleConfirm = () => {
    if (!selectedPlayer || !selectedSeason) {
      return
    }

    onConfirm({
      player: selectedPlayer,
      season: selectedSeason,
    })
  }

  if (!isOpen || !slot) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-neutral-900 shadow-2xl sm:max-w-xl sm:rounded-3xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-white/10 bg-neutral-900 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-green-500">
              Player {slot.id}
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              Select a footballer
            </h2>

            <p className="mt-1 text-sm text-neutral-400">
              {slot.club} · {slot.position} · {slot.period}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xl text-neutral-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          <label
            htmlFor="player-search"
            className="mb-2 block text-sm font-semibold text-neutral-300"
          >
            Search player
          </label>

          <input
            id="player-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="For example: Lewandowski"
            autoFocus
            className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-green-500"
          />

          <div className="mt-4 space-y-2">
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => {
                const isSelected = selectedPlayer?.id === player.id

                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlayer(player)
                      setSelectedSeasonId("")
                    }}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-green-500 bg-green-500/10"
                        : "border-white/10 bg-neutral-950 hover:border-white/20"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-white">{player.name}</p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {player.nationality} · {player.position}
                      </p>
                    </div>

                    <span
                      className={`text-sm font-semibold ${
                        isSelected ? "text-green-400" : "text-neutral-600"
                      }`}
                    >
                      {isSelected ? "Selected" : "Choose"}
                    </span>
                  </button>
                )
              })
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-neutral-500">
                No players found.
              </div>
            )}
          </div>

          {selectedPlayer && (
            <div className="mt-6 border-t border-white/10 pt-5">
              <label
                htmlFor="season-select"
                className="mb-2 block text-sm font-semibold text-neutral-300"
              >
                Select season
              </label>

              <select
                id="season-select"
                value={selectedSeasonId}
                onChange={(event) => setSelectedSeasonId(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-green-500"
              >
                <option value="">Choose a season</option>

                {selectedPlayer.seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.season} — {season.club}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedSeason && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-neutral-950 px-3 py-4 text-center">
                <p className="text-xl font-bold text-white">
                  {selectedSeason.appearances}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  Appearances
                </p>
              </div>

              <div className="rounded-xl bg-neutral-950 px-3 py-4 text-center">
                <p className="text-xl font-bold text-white">
                  {selectedSeason.goals}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  Goals
                </p>
              </div>

              <div className="rounded-xl bg-neutral-950 px-3 py-4 text-center">
                <p className="text-xl font-bold text-white">
                  {selectedSeason.assists}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  Assists
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 border-t border-white/10 bg-neutral-900 p-5">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedPlayer || !selectedSeason}
            className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-500"
          >
            Confirm selection
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlayerModal