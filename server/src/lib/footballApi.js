const API_BASE_URL = "https://v3.football.api-sports.io"

export async function footballApiRequest(endpoint, params = {}) {
  const apiKey = process.env.API_FOOTBALL_KEY

  if (!apiKey) {
    throw new Error("API_FOOTBALL_KEY is not configured")
  }

  const url = new URL(`${API_BASE_URL}${endpoint}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value))
    }
  })

  const response = await fetch(url, {
    headers: {
      "x-apisports-key": apiKey,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.errors?.token ||
        `API-Football request failed with status ${response.status}`,
    )
  }

  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(
      `API-Football returned errors: ${JSON.stringify(data.errors)}`,
    )
  }

  return data
}