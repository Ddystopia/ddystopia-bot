const { MessageEmbed } = require('discord.js')
const User = require('../../classes/User')
const sqlite3 = require('sqlite3').verbose()
const log = require('../../utils/log.js')
class RolesBoard {
  static async getRoles() {
    const db = new sqlite3.Database('./data.db')
    const roles = new Promise(resolve =>
      db.all('SELECT id, cost FROM roles ORDER BY cost DESC', (err, roles) => {
        const res = roles.reduce((res, row) => ({ ...res, [row.id]: row.cost }), {})
        resolve(res)
      })
    )
    db.close()
    return roles
  }
  static shopList(message) {
    const shopList = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Роли')
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/402109825896415232/692820764478668850/yummylogo.jpg'
      )
      .setTimestamp()
    RolesBoard.roles = sortAndCleanRoles(RolesBoard.roles, message)
    let i = 0
    for (const roleId in RolesBoard.roles) {
      if (!RolesBoard.roles[roleId]) continue
      const role = message.member.guild.roles.cache.get(roleId)
      const cost = RolesBoard.roles[roleId]
      shopList.addField(++i, `${role} - ${cost} ${currency}`)
    }
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
    RolesBoard.roles[role.id] = +args[args.length - 1]

    log(
      `${message.author.username}(${message.member}) add role to shop ${role.name}(${role})`
    )
    RolesBoard.shopList(message)
    const db = new sqlite3.Database('./data.db')
    db.run(
      `UPDATE roles SET id=${role.id} cost=${+args[args.length - 1]} WHERE id=${role.id}`
    )
    db.close()
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

    delete RolesBoard.roles[role.id]

    log(
      `${message.author.username}(${message.member}) remove role from shop ${role.name}(${role})`
    )
    RolesBoard.shopList(message)
    const db = new sqlite3.Database('./data.db')
    db.run(`DELETE FROM roles WHERE id=${role.id}`)
    db.close()
  }
  static async buy(message, args) {
    if (isNaN(+args[1])) return
    const roleId = Object.keys(RolesBoard.roles)[+args[1] - 1]
    const role = message.member.guild.roles.cache.get(roleId)
    if (!role) return message.reply('Такая роль не существует')

    const cost = RolesBoard.roles[role.id]
    if (!cost) return message.reply('Такая роль не продаётся')

    const id = message.author.id
    const user = await User.getOrCreateUser(id)

    if (user.coins < cost) return message.reply(`Не хватает ${currency}`)
    if (message.member.roles.cache.has(role.id))
      return message.reply('У вас уже есть эта роль')
    user.coins -= cost
    message.member.roles.add(role)
    message.react('✅')
    log(`${message.author.username}(${message.member}) buy role ${role.name}(${role})`)
    user.save()
  }
  static async sell(message, args) {
    if (isNaN(+args[1])) return
    const roleId = Object.keys(RolesBoard.roles)[+args[1] - 1]
    const role = message.member.guild.roles.cache.get(roleId)
    if (!role) return message.reply('Такая роль не существует')

    const cost = RolesBoard.roles[role.id]
    if (!cost) return message.reply('Такая роль не продаётся')

    const id = message.author.id
    const user = await User.getOrCreateUser(id)

    if (!message.member.roles.cache.has(role.id))
      return message.reply('У вас нет этой роли')

    user.coins += cost * 0.9
    message.member.roles.remove(role)

    log(`${message.author.username}(${message.member}) sell role ${role.name}(${role})`)
    message.reply(`Успех, вы получили ${cost * 0.9} ${currency}`)
    user.save()
  }
}

module.exports.run = async (client, message, args) => {
  RolesBoard.roles = await RolesBoard.getRoles(message)
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
