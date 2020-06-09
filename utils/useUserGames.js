module.exports = useUserGames = (id, games, lastGames) => {
  if (games.has(id)) games.set(id, games.get(id) + 1)
  else games.set(id, 0)

  if (lastGames.has(id)) {
    if (Date.now() - lastGames.get(id) > 7 * 60 * 1000) {
      lastGames.set(id, Date.now())
      games.set(id, 0)
    } else lastGames.set(id, Date.now())
  } else lastGames.set(id, Date.now())

  return games.get(id)
}
