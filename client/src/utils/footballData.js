export function normalizeText(value = "") {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
}

export function createSeasonLabel(startYear) {
  const endYear = String(startYear + 1).slice(-2)

  return `${startYear}/${endYear}`
}

export function mapPosition(position) {
  switch (position?.toLowerCase()) {
    case "goalkeeper":
      return "GOALKEEPER"

    case "defender":
      return "DEFENDER"

    case "midfielder":
      return "MIDFIELDER"

    case "attacker":
    case "forward":
      return "FORWARD"

    default:
      return "UNKNOWN"
  }
}

export function parseBirthDate(date) {
  if (!date) {
    return null
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`)

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

export function parseRating(rating) {
  if (rating === null || rating === undefined || rating === "") {
    return null
  }

  const parsedRating = Number.parseFloat(rating)

  return Number.isNaN(parsedRating) ? null : parsedRating
}