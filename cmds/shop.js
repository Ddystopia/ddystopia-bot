const Discord = module.require('discord.js')
const fs = require('fs')

let roles = require(__dirname.replace(/cmds$/, '') + `roles.json`)

class RolesBoard {
  static shopList(message) {
    const shopList = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Роли')
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/402109825896415232/692820764478668850/yummylogo.jpg'
      )
      .setTimestamp()
    let rolesClone = {}
    Object.entries(roles)
      .sort((a, b) => +b[1] - +a[1])
      .forEach(e => {
        if (!message.member.guild.roles.cache.has(e[0]) || !e[1]) return
        rolesClone[e[0]] = e[1]
      })
    roles = rolesClone
    rolesClone = null
    let i = 0
    for (const roleId in roles) {
      if (!roles.hasOwnProperty(roleId)) continue
      if (!roles[roleId]) continue
      const role = message.member.guild.roles.cache.get(roleId)
      const cost = roles[roleId]
      shopList.addField(++i, `${role.name} - ${cost} монет`)
    }
    fs.writeFile(__dirname.replace(/cmds$/, '') + `roles.json`, JSON.stringify(roles), err =>
      err ? console.log(err) : null
    )
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
    fs.writeFile(__dirname.replace(/cmds$/, '') + `roles.json`, JSON.stringify(roles), err =>
      err ? console.log(err) : null
    )
    let rolesClone = {}
    Object.entries(roles)
      .sort((a, b) => +b[1] - +a[1])
      .forEach(e => {
        if (!message.member.guild.roles.cache.has(e[0]) || !e[1]) return
        rolesClone[e[0]] = e[1]
      })
    roles = rolesClone
    rolesClone = null
    fs.writeFile(__dirname.replace(/cmds$/, '') + `roles.json`, JSON.stringify(roles), err =>
      err ? console.log(err) : null
    )

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
    fs.writeFile(__dirname.replace(/cmds$/, '') + `roles.json`, JSON.stringify(roles), err =>
      err ? console.log(err) : null
    )
    let rolesClone = {}
    Object.entries(roles)
      .sort((a, b) => +b[1] - +a[1])
      .forEach(e => (rolesClone[e[0]] = e[1]))
    roles = rolesClone
    rolesClone = null
    fs.writeFile(__dirname.replace(/cmds$/, '') + `roles.json`, JSON.stringify(roles), err =>
      err ? console.log(err) : null
    )

    RolesBoard.shopList(message)
  }
  static buy(message, args) {
    if (isNaN(args[1])) return
    const roleId = Object.keys(roles)[+args[1] - 1]
    const role = message.member.guild.roles.cache.get(roleId)
    if (!role) return message.reply(roleName + ' : Такая роль не существует')
    const cost = roles[role.id]
    if (!cost) return message.reply(roleName + ' : Такая роль не продаётся')
    const fromId = message.author.id
    const profileFrom = require(__dirname.replace(/cmds$/, '') + `profiles/${fromId}.json`)
    if (profileFrom.coins < cost) return message.reply('Не хватает монет')
    if (message.member.roles.cache.has(role.id)) return message.reply('У вас уже есть эта роль')
    profileFrom.coins -= cost
    message.member.roles.add(role)
    message.reply('Succcess')
    fs.writeFile(
      __dirname.replace(/cmds$/, '') + `profiles/${fromId}.json`,
      JSON.stringify(profileFrom),
      err => (err ? console.log(err) : null)
    )
  }
  static sell(message, args) {
    if (isNaN(args[1])) return
    const roleId = Object.keys(roles)[+args[1] - 1]
    const role = message.member.guild.roles.cache.get(roleId)
    if (!role) return message.reply(roleName + ' : Такая роль не существует')
    const cost = roles[role.id]
    if (!cost) return message.reply(roleName + ' : Такая роль не продаётся')
    const fromId = message.author.id
    const profileFrom = require(__dirname.replace(/cmds$/, '') + `profiles/${fromId}.json`)
    if (!message.member.roles.cache.has(role.id)) return message.reply('У вас нет этой роли')
    profileFrom.coins += cost * 0.9
    message.member.roles.remove(role)
    message.reply(`Succcess, you get ${cost * 0.9} coins`)
    fs.writeFile(
      __dirname.replace(/cmds$/, '') + `profiles/${fromId}.json`,
      JSON.stringify(profileFrom),
      err => (err ? console.log(err) : null)
    )
  }
}

module.exports.run = async (client, message, args) => {
  if (message.channel.id !== '693487254911582259') return
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
module.exports.help = {
  name: 'shop',
}
