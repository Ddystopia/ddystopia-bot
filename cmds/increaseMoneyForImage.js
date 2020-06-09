const Discord = module.require('discord.js')
const fs = require('fs')
let cost = 100
const games = new Map()
const lastGames = new Map()

module.exports.run = async (client, message) => {
  if (games.has(message.author.id))
    games.set(message.author.id, games.get(message.author.id) + 1)
  else games.set(message.author.id, 0)

  if (lastGames.has(message.author.id)) {
    if (Date.now() - lastGames.get(message.author.id) < 60 * 60 * 1000) {
      lastGames.set(message.author.id, Date.now())
      games.set(message.author.id, 0)
    }
  } else lastGames.set(message.author.id, Date.now())

  const userGames = games.get(message.author.id)

  if (userGames > 40) return

  const attachmentsNum = message.attachments.size
  if (!attachmentsNum) return
  let profile
  try {
    profile = require(__dirname.replace(/cmds$/, '') +
      `profiles/${message.author.id}.json`)
  } catch (err) {
    profile = {
      coins: 0,
      resentDaily: Date.now() - 1000 * 60 * 60 * (24 + 1),
    }
  }
  profile.coins += attachmentsNum * cost
  fs.writeFile(
    __dirname.replace(/cmds$/, '') + `profiles/${message.author.id}.json`,
    JSON.stringify(profile),
    err => (err ? console.log(err) : null)
  )
}

module.exports.help = {
  name: 'increaseMoneyForImage',
}
