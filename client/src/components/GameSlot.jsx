function RequirementBadge({ label, value, qualifier }) {
  return (
    <div className="flex min-h-24 flex-1 flex-col items-center justify-center px-3 py-4 text-center">
      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
        {label}
      </span>

      <span className="mt-1 text-sm font-bold text-white sm:text-base">
        {value}
      </span>

      <span className="mt-2 rounded bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
        {qualifier}
      </span>
    </div>
  )
}

function GameSlot({
  number,
  club,
  period,
  position,
  scoreCategory,
  selection,
  onSelect,
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
      <div className="border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Player {number}
          </span>

          <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
            {scoreCategory}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-white/10">
        <RequirementBadge
          label="Club"
          value={club}
          qualifier="Same season"
        />

        <RequirementBadge
          label="Season"
          value={period}
          qualifier="Selected year"
        />

        <RequirementBadge
          label="Position"
          value={position}
          qualifier="Same season"
        />
      </div>

      <div className="border-t border-white/10 p-4">
        {selection ? (
          <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-white">{selection.player.name}</p>

                <p className="mt-1 text-sm text-neutral-400">
                  {selection.season.season} · {selection.season.club}
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">
                  {selection.score}
                </p>

                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  {scoreCategory}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onSelect}
              className="mt-4 w-full rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-neutral-300 transition hover:bg-white/5 hover:text-white"
            >
              Change player
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSelect}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-500 active:scale-[0.99]"
          >
            <span className="text-xl leading-none">+</span>
            Select player
          </button>
        )}
      </div>
    </article>
  )
}

export default GameSlot