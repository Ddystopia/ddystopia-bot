const { MessageEmbed } = require('discord.js')
const User = require('../../classes/User')
const useUserGames = require('../../utils/useUserGames')
const randomInteger = require('../../utils/randomInteger')
const rainbow = require('../../utils/rainbow.js')
const games = new Map()
const lastGames = new Map()

module.exports.run = async (client, message, args) => {
  if (message.channel.id !== '693487254911582259') return
  if (!args) return
  if (isNaN(+args[0]) && args[0] != 'all') return
  if (+args[0] <= 0) return

  const userGames = useUserGames(message.author.id, games, lastGames)

  const user = await User.getOrCreateUser(message.author.id)

  const bet = args[0] == 'all' ? user.coins : +args[0]
  const betNum = randomInteger(-30, 70) + 30
  let percent = 50 - (userGames * 1.2 - 12)
  if (percent < 10) percent = 10
  const realNum =
    userGames < 15
      ? randomInteger(0, 100)
      : randomInteger(0, 99) <= percent
      ? randomInteger(65, 99)
			: randomInteger(0, 64)
			
  let jackpot = ''

  if (user.coins < bet) return message.reply(`Не хватает ${currency}`)

  if (betNum == realNum && randomInteger(0, 1) && games.get(message.author.id) < 20)
    jackpot =
      ', но вам улыбнулясь удача, поэтому вы получаете надбавку в 10000 и множитель на выиграш 30!!!'

  const embed = new MessageEmbed().setColor(rainbow())

  if (realNum >= 65) {
    let factor = realNum == 100 ? 7 : realNum >= 90 ? 3.5 : 2
    //if == 100 factor = 7 if >= 90 factor = 3.5 else factor = 2
    if (jackpot) {
      factor *= 30
      user.coins += 10000
    }
    user.coins += bet * factor - bet
    embed.addField(
      'Расчёт',
      `Вам выпало число ${realNum}, и вы выиграли ${
        bet * factor
      } ${currency}${jackpot}\nНа вашем счету теперь ${user.coins} ${currency}\n`
    )
  } else {
    user.coins -= bet
    if (jackpot) user.coins += 10000
    embed.addField(
      'Расчёт',
      `Вам выпало число ${realNum}, и вы потеряли ${bet} ${currency}${jackpot}\nНа вашем счету теперь ${user.coins} ${currency}\n`
    )
  }
  user.save()
  message.reply(embed)
}

module.exports.help = {
  name: 'br',
}
