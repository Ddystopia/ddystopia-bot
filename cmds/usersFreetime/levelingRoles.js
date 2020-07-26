const { MessageEmbed } = require('discord.js')
const { RolesLeveling } = require('../../classes/RolesLeveling')
const { RoleForLeveling } = require('../../models/RoleForLeveling')
const { log } = require('../../utils/log.js')

class RolesBoard {
  static shopList(message) {
    const shopList = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Роли')
      .setThumbnail(message.author.avatarURL())
      .setTimestamp()
    const roles = sortAndClean(RoleForLeveling.find({ guildId: message.guild.id }))
    let i = 0
    for (const roleId in roles) {
      if (!roles[roleId]) continue
      const role = message.member.guild.roles.cache.get(roleId)
      const level = roles[roleId]
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
    new RoleForLeveling({
      id: role.id,
      level: +args[args.length - 1],
      guildId: message.guild.id,
    }).save()

    log(`${message.author.tag} add role to shop ${role.name}(${role})`)
    RolesBoard.shopList(message)
  }
  static remove(message) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return
    const roleNameMath = message.content.match(/(?<=\[)(.+?)(?=])/)
    const role = message.guild.roles.cache.find(
      r => roleNameMath && r.name.toLowerCase() === roleNameMath[1].toLowerCase()
    )
    if (!role) return
    RoleForLeveling.deleteOne({
      id: role.id,
      guildId: message.guild.id,
    })

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
  name: 'levelingRoles',
}
