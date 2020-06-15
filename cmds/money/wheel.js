const { MessageEmbed } = require('discord.js')
const randomInteger = require('../../utils/randomInteger.js')
const useUserGames = require('../../utils/useUserGames')
const rainbow = require('../../utils/rainbow.js')
const readWrite = require('../../utils/readWriteFile')
const games = new Map()
const lastGames = new Map()

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

  const userGames = useUserGames(message.author.id, games, lastGames)

  const profile = readWrite.profile(message.author.id)

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

  if (profile.coins < bet) return message.reply(`Не хватает ${currency}`)
  profile.coins -= bet

  const embed = new MessageEmbed().setColor(rainbow())

  factors.splice(4, 0, arrow)

  const response = factors
    .map((item, i) => ((i + 1) % 3 == 0 ? item + '\n\n' : item + '     '))
    .join('')
    .trim()

  profile.coins += Math.floor(bet * factor)
  embed.addField(
    'Расчёт',
    `Вы выиграли ${Math.floor(bet * factor)} ${currency}\nНа вашем счету теперь ${
      profile.coins
    } ${currency}\n`
  )
  readWrite.profile(message.author.id, profile)

  message.reply('\n' + response, embed)
}

module.exports.help = {
  name: 'wheel',
}
