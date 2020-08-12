const { MessageEmbed } = require('discord.js')
const { User } = require('../../models/User')
const { Loot } = require('../../models/Loot')
const { slider } = require('../../utils/slider')
const { getConvertedEmojiArray } = require('../../utils/getConvertedEmojiArray')
const MAX_FIELDS = 25

class EmbedInstance extends MessageEmbed {
  constructor(avatarUrl) {
    super()
    this.setColor('#0099ff').setTitle('Market').setThumbnail(avatarUrl).setTimestamp()
  }
}

class LootBoard {
  static async shopList(message) {
    const allLoot = await Loot.find({ guildId: message.guild.id }).sort({ cost: 'desc' })
    const embeds = []
    if (allLoot.length === 0)
      embeds.push(
        new EmbedInstance(message.author.avatarURL()).addField(`Пусто`, '\u200B')
      )
    for (let i = 0; i < Math.ceil(allLoot.length / MAX_FIELDS); i++) {
      const lootChunk = allLoot.slice(i * MAX_FIELDS, (i + 1) * MAX_FIELDS)
      const shopList = new EmbedInstance(message.author.avatarURL())
      for (let { loot, cost } of lootChunk)
        shopList.addField('\u200B', `${loot} - ${cost}${global.currency}`, true)
      embeds.push(shopList)
    }
    slider(embeds, message)
  }
  static async add(message, [, lootProp, cost]) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return
    if (isNaN(+cost)) return

    const loot = getConvertedEmojiArray(lootProp)[0]
    await Loot.deleteOne({ loot, guildId: message.guild.id })
    await new Loot({ loot, cost, guildId: message.guild.id }).save()

    LootBoard.shopList(message)
  }
  static async remove(message, args) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return
    const loot = getConvertedEmojiArray(args[1])[0]
    User.find({ guildId: message.guild.id }, (err, res) =>
      res.forEach(user => {
        for (let i = 0; user.loot.number; i++) user.removeLoot(loot)
        user.save()
      })
    )

    await Loot.deleteOne({ loot, guildId: message.guild.id })
    LootBoard.shopList(message)
  }
  static async buy(message) {
    const allLoot = await Loot.find({ guildId: message.guild.id })
    const lootArray = getConvertedEmojiArray(message.content, allLoot)
    if (lootArray.length < 1) return message.reply('Не продаётся')
    const cost = lootArray.reduce((sum, lootItem) => {
      return sum + allLoot.find(el => el.loot === lootItem).cost
    }, 0)
    const user = await User.getOrCreate(message.author.id, message.guild.id)
    if (user.coins < cost) return message.reply(`Не хватает ${global.currency}`)

    user.coins -= cost
    user.addLoot(lootArray)
    message.react('✅')
    user.save()
  }
  static async sell(message, args) {
    const loot = await Loot.find({ guildId: message.guild.id })
    const user = await User.getOrCreate(message.author.id, message.guild.id)
    let lootArray = []
    if (args[1] === 'all')
      for (const ownLoot of user.loot)
        for (let i = 0; i < ownLoot.number; i++) lootArray.push(ownLoot.loot)
    else lootArray = user.getLootArray(args.slice(1).join(''), loot)

    if (lootArray.length < 1) return message.reply('Не продаётся')

    const cost = lootArray.reduce((sum, lootItem) => {
      return sum + loot.find(el => el.loot === lootItem).cost
    }, 0)
    user.coins += cost * 0.9
    user.removeLoot(lootArray)

    message.reply(`Успех, вы получили ${cost * 0.9}${global.currency}`)
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

module.exports.help = {
  name: 'market',
}
