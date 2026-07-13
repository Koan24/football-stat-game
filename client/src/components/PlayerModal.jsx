import { useEffect, useMemo, useState } from "react"
import Toast from "./Toast"
import {
  getPlayerSeasons,
  searchPlayers,
} from "../api/playersApi"

function PlayerModal({
  slot,
  selections,
  currentSelection,
  onClose,
  onConfirm,
}) {
  const [search, setSearch] = useState("")
  const [selectedPlayer, setSelectedPlayer] = useState(
  currentSelection?.player ?? null,
  )

  const [selectedSeasonId, setSelectedSeasonId] = useState(
    currentSelection ? String(currentSelection.season.id) : "",
  )
  const [toastMessage, setToastMessage] = useState("")
  const [playerResults, setPlayerResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(false)

  useEffect(() => {
    const query = search.trim()
    
    if (query.length < 2) {
      return undefined
    }
  
    const abortController = new AbortController()
  
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsSearching(true)
      
        const results = await searchPlayers(
          query,
          abortController.signal,
        )
      
        setPlayerResults(results)
      } catch (error) {
        if (error.name !== "AbortError") {
          setPlayerResults([])
          setToastMessage(error.message)
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsSearching(false)
        }
      }
    }, 300)
  
    return () => {
      window.clearTimeout(timeoutId)
      abortController.abort()
    }
  }, [search])

  const usedPlayerIds = useMemo(() => {
    return Object.entries(selections)
      .filter(([slotId]) => Number(slotId) !== slot?.id)
      .map(([, selection]) => selection.player.id)
  }, [selections, slot])

  const selectedSeason = selectedPlayer?.seasons?.find(
    (season) => season.id === Number(selectedSeasonId),
  )

  const handlePlayerSelect = async (player) => {
    if (
      usedPlayerIds.includes(player.id) ||
      isLoadingSeasons
    ) {
      return
    }

    try {
      setIsLoadingSeasons(true)
      setToastMessage("")
      setSelectedSeasonId("")

      const playerWithSeasons = await getPlayerSeasons(player.id)

      const seasons = playerWithSeasons.statistics.map(
        (statistics) => ({
          id: statistics.id,
          season: statistics.season.label,
          seasonStartYear: statistics.season.startYear,
          club: statistics.club.name,
          clubId: statistics.club.id,
          clubLogoUrl: statistics.club.logoUrl,
          league: statistics.competition.name,
          competitionId: statistics.competition.id,
          position: statistics.position,
          appearances: statistics.appearances,
          starts: statistics.starts,
          minutes: statistics.minutes,
          goals: statistics.goals,
          assists: statistics.assists,
          yellowCards: statistics.yellowCards,
          redCards: statistics.redCards,
          cleanSheets: statistics.cleanSheets,
          rating: statistics.rating,
        }),
      )

      setSelectedPlayer({
        id: playerWithSeasons.id,
        name: playerWithSeasons.name,
        nationality: playerWithSeasons.nationality,
        photoUrl: playerWithSeasons.photoUrl,
        position:
          seasons[0]?.position ??
          player.position ??
          "UNKNOWN",
        seasons,
      })
    } catch (error) {
      setSelectedPlayer(null)
      setSelectedSeasonId("")
      setToastMessage(error.message)
    } finally {
      setIsLoadingSeasons(false)
    }
  }

  const handleSeasonChange = (event) => {
    setSelectedSeasonId(event.target.value)
    setToastMessage("")
  }

  const handleConfirm = () => {
    if (!selectedPlayer || !selectedSeason) {
      setToastMessage(
        "Wybierz zawodnika oraz jeden z jego sezonów.",
      )
      return
    }

    const errors = onConfirm({
      player: selectedPlayer,
      season: selectedSeason,
    })

    if (errors?.length > 0) {
      setToastMessage(errors.join(" "))
    }
  }

  if (!slot) {
    return null
  }

  return (
    <>
      <Toast
        message={toastMessage}
        type="error"
        onClose={() => setToastMessage("")}
      />

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
              onChange={(event) => {
                const value = event.target.value

                setSearch(value)
                setToastMessage("")

                if (value.trim().length < 2) {
                  setPlayerResults([])
                  setIsSearching(false)
                }
              }}
              placeholder="For example: Salah"
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-green-500"
            />

            <div className="mt-4 space-y-2">
              {search.trim().length < 2 ? (
                <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-neutral-500">
                  Enter at least two characters to search.
                </div>
              ) : isSearching ? (
                <div className="rounded-xl border border-white/10 px-4 py-8 text-center text-sm text-neutral-400">
                  Searching players...
                </div>
              ) : playerResults.length > 0 ? (
                playerResults.map((player) => {
                  const isSelected =
                    selectedPlayer?.id === player.id

                  const isAlreadyUsed =
                    usedPlayerIds.includes(player.id)

                  return (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() =>
                        handlePlayerSelect(player)
                      }
                      disabled={
                        isAlreadyUsed || isLoadingSeasons
                      }
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                        isSelected
                          ? "border-green-500 bg-green-500/10"
                          : isAlreadyUsed
                            ? "cursor-not-allowed border-white/5 bg-neutral-950/50 opacity-50"
                            : "border-white/10 bg-neutral-950 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {player.photoUrl ? (
                          <img
                            src={player.photoUrl}
                            alt=""
                            className="h-10 w-10 rounded-full bg-neutral-800 object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-sm font-bold text-neutral-400">
                            {player.name.charAt(0)}
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-white">
                            {player.name}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            {player.nationality ??
                              "Unknown nationality"}{" "}
                            · {player.position ?? "UNKNOWN"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-sm font-semibold ${
                          isSelected
                            ? "text-green-400"
                            : isAlreadyUsed
                              ? "text-red-400"
                              : "text-neutral-600"
                        }`}
                      >
                        {isSelected
                          ? "Selected"
                          : isAlreadyUsed
                            ? "Already used"
                            : "Choose"}
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

            {isLoadingSeasons && (
              <div className="mt-5 rounded-xl border border-white/10 bg-neutral-950 px-4 py-5 text-center text-sm text-neutral-400">
                Loading player seasons...
              </div>
            )}

            {selectedPlayer && !isLoadingSeasons && (
              <div className="mt-6 border-t border-white/10 pt-5">
                <label
                  htmlFor="season-select"
                  className="mb-2 block text-sm font-semibold text-neutral-300"
                >
                  Select season
                </label>

                {selectedPlayer.seasons.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-neutral-500">
                    No imported seasons available for this player.
                  </div>
                ) : (
                  <select
                    id="season-select"
                    value={selectedSeasonId}
                    onChange={handleSeasonChange}
                    className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-green-500"
                  >
                    <option value="">Choose a season</option>

                    {selectedPlayer.seasons.map((season) => (
                      <option
                        key={season.id}
                        value={season.id}
                      >
                        {season.season} — {season.club}
                      </option>
                    ))}
                  </select>
                )}
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
              disabled={
                !selectedPlayer ||
                !selectedSeason ||
                isLoadingSeasons
              }
              className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-500"
            >
              Confirm selection
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default PlayerModal