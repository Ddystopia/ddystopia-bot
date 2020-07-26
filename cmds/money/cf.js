const { MessageEmbed } = require('discord.js')
const { User } = require('../../models/User')
const { useUserGames } = require('../../utils/useUserGames')
const { randomInteger } = require('../../utils/randomInteger.js')
const { rainbow } = require('../../utils/rainbow.js')

const sides = ['h', 't']
const sidesImages = {
  h: 'https://i.ibb.co/ryYH1hf/headers.png',
  t: 'https://i.ibb.co/72v7MVs/tails.png',
}
const games = new Map()
const lastGames = new Map()

module.exports.run = async (message, [propBet, propSide]) => {
  if (isNaN(+propBet) && propBet !== 'all') return
  if (+propBet <= 0) return
  if (propSide != sides[0] && propSide != sides[1]) return

  const userGames = useUserGames(message.author.id, games, lastGames)

  const user = await User.getOrCreate(message.author.id, message.guild.id)

  const bet = propBet === 'all' ? user.coins : +propBet
  const bettedSide = propSide
  let percent = 50 - (userGames * 1.2 - 12)
  if (percent < 10) percent = 10
  const loseSide = sides.join('').replace(propBet, '')
  const side =
    userGames < 11
      ? sides[randomInteger(0, 1)]
      : randomInteger(0, 99) <= percent
      ? bettedSide
      : loseSide
  if (user.coins < bet) return message.reply(`Не хватает ${global.currency}`)

  const embed = new MessageEmbed().setColor(rainbow()).setImage(sidesImages[side])

  if (bettedSide == side) {
    user.coins += bet
    embed.addField(
      'Расчёт',
      `Вы выиграли ${bet} ${global.currency}\nНа вашем счету теперь ${user.coins} ${global.currency}\n`
    )
  } else {
    user.coins -= bet
    embed.addField(
      'Расчёт',
      `Вы потеряли ${bet} ${global.currency}\nНа вашем счету теперь ${user.coins} ${global.currency}\n`
    )
  }
  user.save()
  message.reply(embed)
}

module.exports.help = {
  name: 'cf',
  aliases: ['bf', 'монетка'],
}
