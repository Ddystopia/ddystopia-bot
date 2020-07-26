const { MessageEmbed } = require('discord.js')
const { User } = require('../../models/User')
const { useUserGames } = require('../../utils/useUserGames')
const { randomInteger } = require('../../utils/randomInteger')
const { rainbow } = require('../../utils/rainbow.js')
const games = new Map()
const lastGames = new Map()

module.exports.run = async (message, [propBet]) => {
  if (isNaN(+propBet) && propBet !== 'all') return
  if (+propBet <= 0) return

  const userGames = useUserGames(message.author.id, games, lastGames)

  const user = await User.getOrCreate(message.author.id, message.guild.id)

  const bet = propBet === 'all' ? user.coins : +propBet
  const betNum = randomInteger(-30, 70) + 30
  let percent = 50 - (userGames * 1.2 - 12)
  if (percent < 10) percent = 10
  const realNum =
    userGames < 15
      ? randomInteger(0, 100)
      : randomInteger(0, 99) <= percent
      ? randomInteger(65, 99)
      : randomInteger(0, 64)

  let jackpotPhrase = ''

  if (user.coins < bet) return message.reply(`Не хватает ${global.currency}`)

  if (betNum == realNum && randomInteger(0, 1) && games.get(message.author.id) < 20)
    jackpotPhrase =
      ', но вам улыбнулясь удача, поэтому вы получаете надбавку в 10000 и множитель на выиграш 30!!!'

  const embed = new MessageEmbed().setColor(rainbow())

  if (realNum >= 65) {
    let factor = realNum == 100 ? 7 : realNum >= 90 ? 3.5 : 2
    //if == 100 factor = 7 if >= 90 factor = 3.5 else factor = 2
    if (jackpotPhrase) {
      factor *= 30
      user.coins += 10000
    }
    user.coins += bet * factor - bet
    embed.addField(
      'Расчёт',
      `Вам выпало число ${realNum}, и вы выиграли ${bet * factor} ${
        global.currency
      }${jackpotPhrase}\nНа вашем счету теперь ${user.coins} ${global.currency}\n`
    )
  } else {
    user.coins -= bet
    if (jackpotPhrase) user.coins += 10000
    embed.addField(
      'Расчёт',
      `Вам выпало число ${realNum}, и вы потеряли ${bet} ${global.currency}${jackpotPhrase}\nНа вашем счету теперь ${user.coins} ${global.currency}\n`
    )
  }
  user.save()
  message.reply(embed)
}

module.exports.help = {
  name: 'br',
}
