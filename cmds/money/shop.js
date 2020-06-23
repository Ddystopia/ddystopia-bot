const { MessageEmbed } = require('discord.js')
const readWrite = require('../../utils/readWriteFile')
const log = require('../../utils/log.js')

let roles = readWrite.file('roles.json')

class RolesBoard {
  static shopList(message) {
    const shopList = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Роли')
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/402109825896415232/692820764478668850/yummylogo.jpg'
      )
      .setTimestamp()
    roles = sortAndCleanRoles(roles, message)
    let i = 0
    for (const roleId in roles) {
      if (!roles.hasOwnProperty(roleId)) continue
      if (!roles[roleId]) continue
      const role = message.member.guild.roles.cache.get(roleId)
      const cost = roles[roleId]
      shopList.addField(++i, `${role} - ${cost} ${currency}`)
    }
    readWrite.file('roles.json', roles)
    return message.reply(shopList)
  }
  static add(message, args) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return
    if (!args[1]) return
    if (isNaN(+args[args.length - 1])) return

    let roleId
    try {
      roleId = args[1].match(/(\d{15,})/)[1]
    } catch (err) {
      return message.reply("I don't know what is it")
    }

    const role = message.member.guild.roles.cache.get(roleId)
    roles[role.id] = +args[args.length - 1]
    roles = sortAndCleanRoles(roles, message)
    readWrite.file('roles.json', roles)

    log(
      `${message.author.username}(${message.member}) add role to shop ${role.name}(${role})`
    )
    RolesBoard.shopList(message)
  }
  static remove(message, args) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return
    if (!args[1]) return

    let roleId
    try {
      roleId = args[1].match(/(\d{15,})/)[1]
    } catch (err) {
      return message.reply("I don't know what is it")
    }
    const role = message.member.guild.roles.cache.get(roleId)

    delete roles[role.id]
    readWrite.file('roles.json', roles)

    log(
      `${message.author.username}(${message.member}) remove role from shop ${role.name}(${role})`
    )
    RolesBoard.shopList(message)
  }
  static buy(message, args) {
    if (isNaN(+args[1])) return
    const roleId = Object.keys(roles)[+args[1] - 1]
    const role = message.member.guild.roles.cache.get(roleId)
    if (!role) return message.reply(roleName + ' : Такая роль не существует')

    const cost = roles[role.id]
    if (!cost) return message.reply(roleName + ' : Такая роль не продаётся')

    const id = message.author.id
    const profile = readWrite.profile(id)

    if (profile.coins < cost) return message.reply(`Не хватает ${currency}`)
    if (message.member.roles.cache.has(role.id))
      return message.reply('У вас уже есть эта роль')
    profile.coins -= cost
    message.member.roles.add(role)
    message.react('✅')
    log(`${message.author.username}(${message.member}) buy role ${role.name}(${role})`)
    readWrite.profile(id, profile)
  }
  static sell(message, args) {
    if (isNaN(+args[1])) return
    const roleId = Object.keys(roles)[+args[1] - 1]
    const role = message.member.guild.roles.cache.get(roleId)
    if (!role) return message.reply(roleName + ' : Такая роль не существует')

    const cost = roles[role.id]
    if (!cost) return message.reply(roleName + ' : Такая роль не продаётся')

    const id = message.author.id
    const profile = readWrite.profile(id)

    if (!message.member.roles.cache.has(role.id))
      return message.reply('У вас нет этой роли')

    profile.coins += cost * 0.9
    message.member.roles.remove(role)

    log(`${message.author.username}(${message.member}) sell role ${role.name}(${role})`)
    message.reply(`Успех, вы получили ${cost * 0.9} ${currency}`)
    readWrite.profile(id, profile)
  }
}

module.exports.run = async (client, message, args) => {
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

function sortAndCleanRoles(roles, message) {
  const rolesClone = {}
  Object.entries(roles)
    .sort((a, b) => +b[1] - +a[1])
    .forEach(e => {
      if (!message.member.guild.roles.cache.has(e[0]) || e[1] == null) return
      rolesClone[e[0]] = e[1]
    })
  return rolesClone
}

module.exports.help = {
  name: 'shop',
}
