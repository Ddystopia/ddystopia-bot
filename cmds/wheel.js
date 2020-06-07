const Discord = module.require('discord.js')
const fs = require('fs')
const games = new Map()
const lastGames = new Map()
const randomInteger = require('../utils/randomInteger.js')

const factorsTable = {
  0.1: '↖',
  0.3: '⬆',
  0.5: '↗',
  0.7: '⬅',
  1: '➡',
  1.5: '↙',
  2.1: '⬇',
  3: '↘',
}

module.exports.run = async (bot, message, args) => {
  if (message.channel.id !== '693487254911582259') return
  if (!args) return
  if (isNaN(+args[0]) && args[0] != 'all') return
  if (+args[0] <= 0) return

  if (games.has(message.author.id)) games.set(message.author.id, games.get(message.author.id) + 1)
  else games.set(message.author.id, 0)

  if (lastGames.has(message.author.id)) {
    if (Date.now() - lastGames.get(message.author.id) > 7 * 60 * 1000) {
      lastGames.set(message.author.id, Date.now())
      games.set(message.author.id, 0)
    } else lastGames.set(message.author.id, Date.now())
  } else lastGames.set(message.author.id, Date.now())

  const userGames = games.get(message.author.id)
  try {
    profile = require(__dirname.replace(/cmds$/, '') + `profiles/${message.author.id}.json`)
  } catch (err) {
    profile = {
      coins: 0,
      resentDaily: Date.now() - 1000 * 60 * 60 * (24 + 1),
    }
  }
  const bet = args[0] == 'all' ? profile.coins : +args[0]

  let percent = 50 - (userGames * 1.2 - 12)
  if (percent < 10) percent = 10
  const rand =
    userGames < 15
      ? randomInteger(0, 7)
      : randomInteger(0, 99) <= percent
      ? randomInteger(4, 7)
      : randomInteger(0, 3)

  const factors = Object.keys(factorsTable).sort((a, b) => a - b)
  const factor = factors[rand]
  const arrow = factorsTable[factor.toString()]

  if (profile.coins < bet) return message.reply('Не хватает монет')
  profile.coins -= bet

  const exampleEmbed = new Discord.MessageEmbed().setColor('#0099ff')

  factors.splice(4, 0, arrow)

  const response = factors
    .map((item, i) => ((i + 1) % 3 == 0 ? item + '\n\n' : item + '     '))
    .join('')
    .trim()

  profile.coins += Math.floor(bet * factor)
  exampleEmbed.addField(
    'Расчёт',
    `Вы выиграли ${Math.floor(bet * factor)} монет\nНа вашем счету теперь ${profile.coins} монет\n`
  )
  fs.writeFile(
    __dirname.replace(/cmds$/, '') + `profiles/${message.author.id}.json`,
    JSON.stringify(profile),
    err => (err ? console.log(err) : null)
  )

  setTimeout(() => {
    message.reply('\n' + response)
    message.channel.send(exampleEmbed)
  }, 50)
}

module.exports.help = {
  name: 'wheel',
}
