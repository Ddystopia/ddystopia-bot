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
    const roles = await RoleForShop.find({ guildId: message.guild.id })
    const rolesEntries = Object.entries(sortAndClean(roles))
    const embeds = []
    if (rolesEntries.length === 0)
      embeds.push(
        new EmbedInstance(message.author.avatarURL()).addField(`Пусто`, '\u200B')
      )
    for (let i = 0; i < Math.ceil(rolesEntries.length / MAX_FIELDS); i++) {
      const rolesChunk = rolesEntries.slice(i * MAX_FIELDS, (i + 1) * MAX_FIELDS)
      const shopList = new EmbedInstance(message.author.avatarURL())
      for (let j = 1; j <= rolesChunk.length; j++)
        shopList.addField(
          j,
          `${rolesChunk[j][0]} - ${rolesChunk[j][1]}${global.currency}`
        )
      embeds.push(shopList)
    }
    slider(embeds, message)
  }
  static add(message, args) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return
    if (!args[1]) return
    if (isNaN(+args[args.length - 1])) return

    let roleId = args[1].match(/(\d{15,})/) && args[1].match(/(\d{15,})/)[1]
    if (!roleId) return message.reply("I don't know what is it")

    new RoleForShop({ id: roleId, guildId: message.guild.id }).save()
    RolesBoard.shopList(message)
  }
  static remove(message, args) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return
    if (!args[1]) return

    let roleId = args[1].match(/(\d{15,})/) && args[1].match(/(\d{15,})/)[1]
    if (!roleId) return message.reply("I don't know what is it")

    RoleForShop.deleteOne({ id: roleId, guildId: message.guild.id })
    RolesBoard.shopList(message)
  }
  static async buy(message, args) {
    if (isNaN(+args[1])) return
    const roles = await RoleForShop.find({ guildId: message.guild.id })
    const roleId = Object.keys(roles)[+args[1] - 1]
    const role = message.member.guild.roles.cache.get(roleId)
    if (!role) return message.reply('Такая роль не существует')

    const cost = roles[role.id]
    if (!cost) return message.reply('Такая роль не продаётся')

    const user = await User.getOrCreate(message.author.id, message.guild.id)

    if (user.coins < cost) return message.reply(`Не хватает ${global.currency}`)
    if (message.member.roles.cache.has(role.id))
      return message.reply('У вас уже есть эта роль')
    user.coins -= cost
    message.member.roles.add(role)
    message.react('✅')
    user.save()
  }
  static async sell(message, args) {
    if (isNaN(+args[1])) return
    const roles = await RoleForShop.find({ guildId: message.guild.id })
    const roleId = Object.keys(roles)[+args[1] - 1]
    const role = message.member.guild.roles.cache.get(roleId)
    if (!role) return message.reply('Такая роль не существует')

    const cost = roles[role.id]
    if (!cost) return message.reply('Такая роль не продаётся')

    const user = await User.getOrCreate(message.author.id, message.guild.id)

    if (!message.member.roles.cache.has(role.id))
      return message.reply('У вас нет этой роли')

    user.coins += cost * 0.9
    message.member.roles.remove(role)

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

function sortAndClean(roles) {
  const rolesClone = {}
  Object.entries(roles)
    .sort((a, b) => +b[1] - +a[1])
    .forEach(e => {
      if (e[1] == null) return
      rolesClone[e[0]] = e[1]
    })
  return rolesClone
}

module.exports.help = {
  name: 'shop',
}
