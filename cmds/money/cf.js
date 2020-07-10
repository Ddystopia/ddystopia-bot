const { MessageEmbed } = require('discord.js')
const User = require('../../classes/User')
const useUserGames = require('../../utils/useUserGames')
const randomInteger = require('../../utils/randomInteger.js')
const rainbow = require('../../utils/rainbow.js')

const sides = ['h', 't']
const sidesImages = {
  h: 'https://i.ibb.co/ryYH1hf/headers.png',
  t: 'https://i.ibb.co/72v7MVs/tails.png',
}
const games = new Map()
const lastGames = new Map()

module.exports.run = async (message, args) => {
  if (message.channel.id !== '693487254911582259') return
  if (!args) return
  if (isNaN(+args[0]) && args[0] != 'all') return
  if (+args[0] <= 0) return
  if (args[1] != sides[0] && args[1] != sides[1]) return

  const userGames = useUserGames(message.author.id, games, lastGames)

	const user = await User.getOrCreateUser(message.author.id)
	
  const bet = args[0] == 'all' ? user.coins : +args[0]
  const bettedSide = args[1]
  let percent = 50 - (userGames * 1.2 - 12)
  if (percent < 10) percent = 10
  const loseSide = sides.join('').replace(args[0], '')
  const side =
    userGames < 11
      ? sides[randomInteger(0, 1)]
      : randomInteger(0, 99) <= percent
      ? bettedSide
      : loseSide
  if (user.coins < bet) return message.reply(`Не хватает ${currency}`)

  const embed = new MessageEmbed().setColor(rainbow()).setImage(sidesImages[side])

  if (bettedSide == side) {
    user.coins += bet
    embed.addField(
      'Расчёт',
      `Вы выиграли ${bet} ${currency}\nНа вашем счету теперь ${user.coins} ${currency}\n`
    )
  } else {
    user.coins -= bet
    embed.addField(
      'Расчёт',
      `Вы потеряли ${bet} ${currency}\nНа вашем счету теперь ${user.coins} ${currency}\n`
    )
  }
  user.save()
  message.reply(embed)
}

module.exports.help = {
  name: 'cf',
}
