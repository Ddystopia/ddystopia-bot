const { MessageEmbed } = require('discord.js')
const readWrite = require('../../utils/readWriteFile')
const { addLoot, removeLoot } = require('../../utils/lootActions')
const MAX_FIELDS = 25

let loot = readWrite.file('loot.json')
class EmbedInstance extends MessageEmbed {
  constructor(title) {
    super()
    this.setColor('#0099ff')
      .setTitle(title)
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/402109825896415232/692820764478668850/yummylogo.jpg'
      )
      .setTimestamp()
  }
}

class LootBoard {
  static shopList(message) {
    const lootEntries = Object.entries(sortAndCleanRoles(loot, message))
    for (let i = 0; i < Math.ceil(lootEntries.length / MAX_FIELDS); i++) {
      const lootChunk = lootEntries.slice(i * MAX_FIELDS, (i + 1) * MAX_FIELDS)
      const shopList = new EmbedInstance(`Часть ${i + 1}`)
      for (let item of lootChunk)
        shopList.addField('\u200B', `${item[0]} - ${item[1]}${currency}`, true)
      message.channel.send(shopList)
    }
  }
  static add(message, args) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return
    if (isNaN(+args[args.length - 1])) return

    loot[args[1]] = +args[args.length - 1]
    loot = sortAndCleanRoles(loot)
    readWrite.file('loot.json', loot)

    LootBoard.shopList(message)
  }
  static remove(message, args) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return

    delete loot[args[1]]
    readWrite.file('loot.json', loot)

    LootBoard.shopList(message)
  }
  static buy(message, args) {
    if (!loot[args[1]]) return message.reply(`${args[1]} : Такая вещь не продаётся`)
    const cost = loot[args[1]]
    const id = message.author.id
    const profile = readWrite.profile(id)

    if (profile.coins < cost) return message.reply(`Не хватает ${currency}`)
    profile.coins -= cost
    addLoot(profile, args[1])

    message.react('✅')
    readWrite.profile(id, profile)
  }
  static sell(message, args) {
    if (!loot[args[1]]) return message.reply(`${args[1]} : Такая вещь не продаётся`)
    const cost = loot[args[1]]
    const id = message.author.id
    const profile = readWrite.profile(id)

    if (!profile.loot[args[1]]) return message.reply('У вас нет этой вещи')

    profile.coins += cost * 0.9
    removeLoot(profile, args[1])

    message.reply(`Успех, вы получили ${cost * 0.9} ${currency}`)
    readWrite.profile(id, profile)
  }
}

module.exports.run = async (client, message, args) => {
  switch (args[0]) {
    case undefined:
    case null:
    case false:
      LootBoard.shopList(message, args)
      break
    case 'add':
      LootBoard.add(message, args)
      break
    case 'remove':
      LootBoard.remove(message, args)
      break
    case 'buy':
      LootBoard.buy(message, args)
      break
    case 'sell':
      LootBoard.sell(message, args)
      break
    default:
      message.reply('Я не знаю, что вы от меня хотите')
  }
}

function sortAndCleanRoles(loot) {
  const rolesClone = {}
  Object.entries(loot)
    .sort((a, b) => +b[1] - +a[1])
    .forEach(e => {
      rolesClone[e[0]] = e[1]
    })
  return rolesClone
}

module.exports.help = {
  name: 'market',
}
