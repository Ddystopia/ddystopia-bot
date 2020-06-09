const Discord = module.require('discord.js')
const fs = require('fs')
const games = new Map()
const lastGames = new Map()
const randomInteger = require('../utils/randomInteger')

module.exports.run = async (client, message, args) => {
  if (message.channel.id !== '693487254911582259') return
  if (!args) return
  if (isNaN(+args[0]) && args[0] != 'all') return
  if (+args[0] <= 0) return

  if (games.has(message.author.id))
    games.set(message.author.id, games.get(message.author.id) + 1)
  else games.set(message.author.id, 0)

  if (lastGames.has(message.author.id)) {
    if (Date.now() - lastGames.get(message.author.id) > 7 * 60 * 1000) {
      lastGames.set(message.author.id, Date.now())
      games.set(message.author.id, 0)
    } else lastGames.set(message.author.id, Date.now())
  } else lastGames.set(message.author.id, Date.now())

  const userGames = games.get(message.author.id)

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
  const bet = args[0] == 'all' ? profile.coins : +args[0]
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

  if (profile.coins < bet || bet <= 0) return message.reply('Не хватает монет')

  if (betNum == realNum && randomInteger(0, 1) && games.get(message.author.id) < 20)
    jackpot =
      ', но вам улыбнулясь удача, поэтому вы получаете надбавку в 10000 и множительна выйграш 100!!!'

  const exampleEmbed = new Discord.MessageEmbed().setColor('#0099ff')

  if (realNum >= 65) {
    let factor = realNum == 100 ? 7 : realNum >= 90 ? 3.5 : 2
    //if == 100 factor = 7 if >= 90 factor = 3.5 else factor = 2
    if (jackpot) {
      factor *= 100
      profile.coins += 10000
    }
    profile.coins += bet * factor - bet
    exampleEmbed.addField(
      'Расчёт',
      `Вам выпало число ${realNum}, и вы выиграли ${
        bet * factor
      } монет${jackpot}\nНа вашем счету теперь ${profile.coins} монет\n`
    )
  } else {
    profile.coins -= bet
    if (jackpot) profile.coins += 10000
    exampleEmbed.addField(
      'Расчёт',
      `Вам выпало число ${realNum}, и вы потеряли ${bet} монет${jackpot}\nНа вашем счету теперь ${profile.coins} монет\n`
    )
  }
  fs.writeFile(
    __dirname.replace(/cmds$/, '') + `profiles/${message.author.id}.json`,
    JSON.stringify(profile),
    err => (err ? console.log(err) : null)
  )
  message.reply(exampleEmbed)
}

module.exports.help = {
  name: 'br',
}
