const { MessageEmbed } = require('discord.js')
const { User } = require('../../models/User')
const { randomInteger } = require('../../utils/randomInteger.js')
const { useUserGames } = require('../../utils/useUserGames')
const { rainbow } = require('../../utils/rainbow.js')
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

module.exports.run = async (message, [propBet]) => {
  if (isNaN(+propBet) && propBet !== 'all') return
  if (+propBet <= 0) return

  const userGames = useUserGames(message.author.id, games, lastGames)
  const user = await User.getOrCreate(message.author.id, message.guild.id)
  const bet = propBet === 'all' ? user.coins : +propBet

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

  if (user.coins < bet) return message.reply(`Не хватает ${global.currency}`)
  user.coins -= bet

  const embed = new MessageEmbed().setColor(rainbow())

  factors.splice(4, 0, arrow)

  const response = factors
    .map((item, i) => ((i + 1) % 3 == 0 ? item + '\n\n' : item + '     '))
    .join('')
    .trim()

  user.coins += Math.floor(bet * factor)
  embed.addField(
    'Расчёт',
    `Вы выиграли ${Math.floor(bet * factor)} ${global.currency}\nНа вашем счету теперь ${
      user.coins
    } ${global.currency}\n`
  )
  user.save()
  message.reply('\n' + response, embed)
}

module.exports.help = {
  name: 'wheel',
}
