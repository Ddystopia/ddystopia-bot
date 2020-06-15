const { MessageEmbed } = require('discord.js')
const readWrite = require('../../utils/readWriteFile')

let roles = require(__dirname.replace(/cmds.+$/, '') + `roles.json`)

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
      shopList.addField(++i, `${role} - ${cost} монет`)
    }
    readWrite.file('roles.json', roles)
    return message.reply(shopList)
  }
  static addRole(message, args) {
    if (
      !message.member.roles.cache.has('691736168693497877') && //Модератор
      !message.member.roles.cache.has('606932311606296624') && //Администратор
      !message.member.roles.cache.has('657964826852589609') //Главный администратор
    )
      return message.reply('Не хватет прав')
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

    RolesBoard.shopList(message)
  }
  static removeRole(message, args) {
    if (
      !message.member.roles.cache.has('691736168693497877') && //Модератор
      !message.member.roles.cache.has('606932311606296624') && //Администратор
      !message.member.roles.cache.has('657964826852589609') //Главный администратор
    )
      return message.reply('Не хватет прав')
    if (!args[1]) return

    let roleId
    try {
      roleId = args[1].match(/(\d{15,})/)[1]
    } catch (err) {
      return message.reply("I don't know what is it")
    }
    const role = message.member.guild.roles.cache.get(roleId)

    roles[role.id] = null
    roles = sortAndCleanRoles(roles, message)
    readWrite.file('roles.json', roles)

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

    if (profile.coins < cost) return message.reply(`Не хватает монет`)
    if (message.member.roles.cache.has(role.id))
      return message.reply('У вас уже есть эта роль')
    profile.coins -= cost
    message.member.roles.add(role)
    message.react('✅')
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
    message.reply(`Success, you get ${cost * 0.9} coins`)
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
    case 'addRole':
      RolesBoard.addRole(message, args)
      break
    case 'removeRole':
      RolesBoard.removeRole(message, args)
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
