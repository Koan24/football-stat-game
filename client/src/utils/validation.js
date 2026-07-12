function getSeasonStartYear(seasonName) {
  const startYear = Number.parseInt(seasonName?.split("/")[0], 10)

  return Number.isNaN(startYear) ? null : startYear
}

export function validatePlayerSelection({
  slot,
  player,
  season,
  selections,
}) {
  const errors = []

  if (!slot) {
    errors.push("Nie znaleziono wybranego pola gry.")
    return errors
  }

  if (!player) {
    errors.push("Wybierz zawodnika.")
    return errors
  }

  if (!season) {
    errors.push("Wybierz sezon.")
    return errors
  }

  const duplicateSelection = Object.entries(selections).find(
    ([slotId, selection]) =>
      Number(slotId) !== slot.id && selection.player.id === player.id,
  )

  if (duplicateSelection) {
    errors.push("Ten zawodnik został już użyty w innym polu.")
  }

  if (slot.club && season.club !== slot.club) {
    errors.push(
      `W wybranym sezonie zawodnik nie występował w klubie ${slot.club}.`,
    )
  }

  const seasonPosition = season.position ?? player.position

  if (slot.position && seasonPosition !== slot.position) {
    errors.push(
      `Zawodnik nie spełnia wymagania pozycji: ${slot.position}.`,
    )
  }

  const seasonStartYear = getSeasonStartYear(season.season)

  if (seasonStartYear === null) {
    errors.push("Nie udało się rozpoznać roku wybranego sezonu.")
  } else if (
    seasonStartYear < slot.seasonFrom ||
    seasonStartYear > slot.seasonTo
  ) {
    errors.push(
      `Sezon musi mieścić się w zakresie ${slot.period}.`,
    )
  }

  return errors
}