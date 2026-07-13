const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000"

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options)

  let data

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.error || "Request failed")
  }

  return data
}

export async function searchPlayers(query, signal) {
  const trimmedQuery = query.trim()

  if (trimmedQuery.length < 2) {
    return []
  }

  return apiRequest(
    `/api/players/search?q=${encodeURIComponent(trimmedQuery)}`,
    { signal },
  )
}

export async function getPlayerSeasons(playerId, signal) {
  return apiRequest(`/api/players/${playerId}/seasons`, { signal })
}