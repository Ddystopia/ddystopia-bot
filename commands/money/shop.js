const { MessageEmbed } = require('discord.js')
const { User } = require('../../models/User')
const { RoleForShop } = require('../../models/RoleForShop')
const { slider } = require('../../utils/slider')
const MAX_FIELDS = 25
class EmbedInstance extends MessageEmbed {
  constructor(avatarUrl) {
    super()
    this.setColor('#0099ff').setTitle('Market').setThumbnail(avatarUrl).setTimestamp()
  }
}
class RolesBoard {
  static async shopList(message) {
    const roles = await RoleForShop.find({ guildId: message.guild.id }).sort({
      cost: 'desc',
    })
    const embeds = []
    if (roles.length === 0)
      embeds.push(
        new EmbedInstance(message.author.avatarURL()).addField(`Пусто`, '\u200B')
      )
    for (let i = 0; i < Math.ceil(roles.length / MAX_FIELDS); i++) {
      const rolesChunk = roles.slice(i * MAX_FIELDS, (i + 1) * MAX_FIELDS)
      const shopList = new EmbedInstance(message.author.avatarURL())
      for (let j = 0; j < rolesChunk.length; j++)
        shopList.addField(
          j + 1,
          `<@&${rolesChunk[j].id}> - ${rolesChunk[j].cost}${global.currency}`
        )
      embeds.push(shopList)
    }
    slider(embeds, message)
  }
  static async add(message, args) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return
    if (!args[1]) return
    if (isNaN(+args[2])) return
    const [roleName] = message.content.match(/(?<=\[)(.+?)(?=])/) || []
    const { id } = message.guild.roles.cache.find(
      r => r.name.toLowerCase() === roleName.toLowerCase()
    )
    if (!id) return message.reply('Я не знаю такого')

    await RoleForShop.deleteOne({ id, guildId: message.guild.id })
    await new RoleForShop({ id, cost: args[2], guildId: message.guild.id }).save()
    RolesBoard.shopList(message)
  }
  static async remove(message, args) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return
    if (!args[1]) return

    const [roleName] = message.content.match(/(?<=\[)(.+?)(?=])/) || []
    const { id } = message.guild.roles.cache.find(
      r => r.name.toLowerCase() === roleName.toLowerCase()
    )
    if (!id) return message.reply('Я не знаю такого')

    await RoleForShop.deleteOne({ id, guildId: message.guild.id })
    RolesBoard.shopList(message)
  }
  static async buy(message) {
    const [name] = message.content.match(/(?<=\[)(.+?)(?=])/) || []
    const { id } = message.guild.roles.cache.find(
      r => r.name.toLowerCase() === name.toLowerCase()
    )
    const { cost } = await RoleForShop.findOne({ id, guildId: message.guild.id })
    if (!cost) return message.reply('Такая роль не продаётся')

    const user = await User.getOrCreate(message.author.id, message.guild.id)

    if (user.coins < cost) return message.reply(`Не хватает ${global.currency}`)
    if (message.member.roles.cache.has(id))
      return message.reply('У вас уже есть эта роль')
    user.coins -= cost
    message.member.roles.add(id)
    message.react('✅')
    user.save()
  }
  static async sell(message) {
    const [name] = message.content.match(/(?<=\[)(.+?)(?=])/) || []
    const { id } = message.guild.roles.cache.find(
      r => r.name.toLowerCase() === name.toLowerCase()
    )
    const { cost } = await RoleForShop.findOne({ id, guildId: message.guild.id })
    if (!cost) return message.reply('Такая роль не продаётся')

    const user = await User.getOrCreate(message.author.id, message.guild.id)

    if (!message.member.roles.cache.has(id)) return message.reply('У вас нет этой роли')

    user.coins += cost * 0.9
    message.member.roles.remove(id)

    message.reply(`Успех, вы получили ${cost * 0.9} ${global.currency}`)
    user.save()
  }
}

module.exports.run = async (message, args) => {
  RolesBoard.roles = await RoleForShop.find({ guildId: message.guild.id })
  switch (args[0]) {
    case undefined:
    case null:
    case false:
      RolesBoard.shopList(message, args)
      break
    case 'add':
      RolesBoard.add(message, args)
      break
    case 'remove':
      RolesBoard.remove(message, args)
      break
    case 'buy':
      RolesBoard.buy(message, args)
      break
    case 'sell':
      RolesBoard.sell(message, args)
      break
    default:
      message.reply('Я не знаю, что вы от меня хотите')
  }
}

module.exports.help = {
  name: 'shop',
}
