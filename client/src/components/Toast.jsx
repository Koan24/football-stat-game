import { useEffect } from "react"

function Toast({ message, type = "error", onClose }) {
  useEffect(() => {
    if (!message) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      onClose()
    }, 3500)

    return () => window.clearTimeout(timeoutId)
  }, [message, onClose])

  if (!message) {
    return null
  }

  const styles =
    type === "success"
      ? "border-green-500/30 bg-green-950 text-green-100"
      : "border-red-500/30 bg-red-950 text-red-100"

  return (
    <div
      className={`fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-sm rounded-xl border p-4 shadow-2xl ${styles}`}
      role="alert"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium leading-5">{message}</p>

        <button
          type="button"
          onClick={onClose}
          className="text-lg leading-none opacity-70 transition hover:opacity-100"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default Toast