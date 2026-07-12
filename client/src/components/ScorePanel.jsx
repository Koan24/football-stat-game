function ScoreItem({ label, value }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-5 text-center">
      <span className="text-3xl font-bold text-white">{value}</span>

      <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        {label}
      </span>
    </div>
  )
}

function ScorePanel({ totalScore, selectedCount }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-lg shadow-black/20">
      <div className="grid grid-cols-2 divide-x divide-white/10">
        <ScoreItem label="Total score" value={totalScore} />
        <ScoreItem label="Players selected" value={`${selectedCount} / 5`} />
      </div>
    </section>
  )
}

export default ScorePanel