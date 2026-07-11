function Header() {
  return (
    <header className="border-b border-white/10 bg-neutral-950">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-500">
            Daily football challenge
          </p>

          <h1 className="mt-1 text-xl font-bold text-white sm:text-2xl">
            Football Stat Game
          </h1>
        </div>

        <button
          type="button"
          className="rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-neutral-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
        >
          How to play
        </button>
      </div>
    </header>
  )
}

export default Header