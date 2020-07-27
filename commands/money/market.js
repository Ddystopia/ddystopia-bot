const { MessageEmbed } = require('discord.js')
const { User } = require('../../models/User')
const { Loot } = require('../../models/Loot')
const { onlyEmoji } = require('emoji-aware')
const { slider } = require('../../utils/slider')
const { log } = require('../../utils/log.js')
const MAX_FIELDS = 25

class EmbedInstance extends MessageEmbed {
  constructor(avatarUrl) {
    super()
    this.setColor('#0099ff').setTitle('Market').setThumbnail(avatarUrl).setTimestamp()
  }
}

class LootBoard {
  static async shopList(message) {
    const loot = await Loot.find({ guildId: message.guild.id })
    const lootEntries = Object.entries(sortAndClean(loot))
    const embeds = []
    for (let i = 0; i < Math.ceil(lootEntries.length / MAX_FIELDS); i++) {
      const lootChunk = lootEntries.slice(i * MAX_FIELDS, (i + 1) * MAX_FIELDS)
      const shopList = new EmbedInstance(message.author.avatarURL())
      for (let item of lootChunk)
        shopList.addField('\u200B', `${item[0]} - ${item[1]}${global.currency}`, true)
      embeds.push(shopList)
    }
    slider(embeds, message)
  }
  static async add(message, args) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return
    if (isNaN(+args[args.length - 1])) return

    new Loot({ loot: args[1], guildId: message.guild.id }).save()

    log(`${message.author.tag} add loot ${args[1]}`)
    LootBoard.shopList(message)
  }
  static async remove(message, args) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return

    Loot.deleteOne({ loot: args[1], guildId: message.guild.id })

    log(`${message.author.tag} remove loot ${args[1]}`)
    LootBoard.shopList(message)
  }
  static async buy(message, args) {
    const loot = await Loot.find({ guildId: message.guild.id })
    const lootArray = onlyEmoji(args.slice(1).join('')).filter(item => !!loot[item])

    if (lootArray.length < 1) return message.reply('Не продаётся')
    const cost = lootArray.reduce((sum, lootItem) => sum + loot[lootItem], 0)
    const user = await User.getOrCreate(message.author.id, message.guild.id)

    if (user.coins < cost) return message.reply(`Не хватает ${global.currency}`)
    user.coins -= cost

    user.addLoot(lootArray)

    log(`${message.author.tag} buy loot ${loot}`)
    message.react('✅')

    user.save()
  }
  static async sell(message, args) {
    const loot = await Loot.find({ guildId: message.guild.id })
    const user = await User.getOrCreate(message.author.id, message.guild.id)
    let lootArray = []
    if (args[1] === 'all')
      for (const loot in user.loot)
        for (let i = 0; i < user.loot[loot]; i++) lootArray.push(loot)
    else lootArray = user.getLootArray(args.slice(1), loot)

    if (lootArray.length < 1) return message.reply('Не продаётся')

    const cost = lootArray.reduce((sum, lootItem) => sum + loot[lootItem], 0)

    user.coins += cost * 0.9
    user.removeLoot(lootArray)

    log(`${message.author.tag} sell loot ${loot}`)
    message.reply(`Успех, вы получили ${cost * 0.9} ${global.currency}`)
    user.save()
  }
}

module.exports.run = async (message, args) => {
  switch (args[0]) {
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
      LootBoard.shopList(message)
  }
}

function sortAndClean(loot) {
  const rolesClone = {}
  Object.entries(loot)
    .sort((a, b) => +b[1] - +a[1])
    .forEach(([id, cost]) => {
      rolesClone[id] = cost
    })
  return rolesClone
}

module.exports.help = {
  name: 'market',
}
