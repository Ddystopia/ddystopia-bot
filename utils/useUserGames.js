module.exports = (id, games, lastGames, mins = 7) => {
  if (games.has(id)) games.set(id, games.get(id) + 1)
  else games.set(id, 0)

  const isTimeEnd = Date.now() - lastGames.get(id) > mins * 60 * 1000
  if (lastGames.has(id) && isTimeEnd) {
    lastGames.set(id, Date.now())
    games.set(id, 0)
  } else lastGames.set(id, Date.now())

  return games.get(id)
}
