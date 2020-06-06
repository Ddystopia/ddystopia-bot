const Discord = module.require('discord.js')
const fs = require('fs')
const randomInteger = require('../utils/randomInteger.js')
// const client = new Discord.Client();

const sides = ['h', 't']
const sidesImages = {
  h: 'https://cdn1.savepice.ru/uploads/2020/3/27/f94b85bebd58457203f02d0dab5a50d9-full.png',
  t: 'https://cdn1.savepice.ru/uploads/2020/3/27/38af340185dcdf87d2a08723719b1193-full.png',
}
const games = new Map()
const lastGames = new Map()

module.exports.run = async (client, message, args) => {
  if (message.channel.id !== '693487254911582259') return
  if (!args) return
  if (isNaN(+args[0]) && args[0] != 'all') return
  if (+args[0] <= 0) return
  if (args[1] != sides[0] && args[1] != sides[1]) return

  if (games.has(message.author.id)) games.set(message.author.id, games.get(message.author.id) + 1)
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
    profile = require(__dirname.replace(/cmds$/, '') + `profiles/${message.author.id}.json`)
  } catch (err) {
    profile = {
      coins: 0,
      resentDaily: Date.now() - 1000 * 60 * 60 * (24 + 1),
    }
  }
  const bet = args[0] == 'all' ? profile.coins : +args[0]
  const betedSide = args[1]
  let parcent = 50 - (userGames * 1.2 - 12)
  if (parcent < 10) parcent = 10
  const loseSide = sides.join('').replace(args[0], '')
  const side =
    userGames < 11
      ? sides[randomInteger(0, 1)]
      : randomInteger(0, 99) <= parcent
      ? betedSide
      : loseSide
  if (profile.coins < bet) return message.reply('Не хватает монет')

  const exampleEmbed = new Discord.MessageEmbed().setColor('#0099ff')

  if (betedSide == side) {
    profile.coins += bet
    exampleEmbed
      .setThumbnail(sidesImages[side])
      .addField(
        'Расчёт',
        `Вы выиграли ${bet} монет\nНа вашем счету теперь ${profile.coins} монет\n`
      )
  } else {
    profile.coins -= bet
    exampleEmbed
      .setImage(sidesImages[side])
      .addField(
        'Расчёт',
        `Вы потеряли ${bet} монет\nНа вашем счету теперь ${profile.coins} монет\n`
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
  name: 'cf',
}
