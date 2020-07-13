const { MessageEmbed } = require('discord.js')
const { RolesLeveling } = require('../../classes/RolesLeveling')
const { log } = require('../../utils/log.js')
const sqlite3 = require('sqlite3').verbose()
class RolesBoard {
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
      const level = RolesBoard.roles[roleId]
      shopList.addField(++i, `${role} - ${level}`)
    }
    return message.reply(shopList)
  }
  static add(message, args) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return
    if (isNaN(+args[args.length - 1])) return
    const roleNameMath = message.content.match(/(?<=\[)(.+?)(?=])/)
    const role = message.guild.roles.cache.find(
      r => roleNameMath && r.name.toLowerCase() === roleNameMath[1].toLowerCase()
    )
    if (!role) return

    RolesBoard.roles[role.id] = +args[args.length - 1]

    log(`${message.author.tag} add role to shop ${role.name}(${role})`)
    RolesBoard.shopList(message)
    const db = new sqlite3.Database('./data.db')
    db.serialize(() => {
      db.run(`DELETE FROM levelingRoles WHERE id='${role.id}'`)
      db.run(
        `INSERT INTO levelingRoles (id, level) VALUES(${role.id}, ${+args[
          args.length - 1
        ]})`,
        err => err && console.error(err)
      )
    })
    db.close()
  }
  static remove(message) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return
    const roleNameMath = message.content.match(/(?<=\[)(.+?)(?=])/)
    const role = message.guild.roles.cache.find(
      r => roleNameMath && r.name.toLowerCase() === roleNameMath[1].toLowerCase()
    )
    if (!role) return

    delete RolesBoard.roles[role.id]
    const db = new sqlite3.Database('./data.db')
    db.run(`DELETE FROM levelingRoles WHERE id='${role.id}'`)
    db.close()

    log(`${message.author.tag} remove role from shop ${role.name}(${role})`)
    RolesBoard.shopList(message)
  }
}

module.exports.run = async (message, args) => {
  RolesBoard.roles = await RolesLeveling.getLevelingRoles()
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
  name: 'levelingRoles',
}
