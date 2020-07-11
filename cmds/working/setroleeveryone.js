const { log } = require('../../utils/log.js')
module.exports.run = async (message, args) => {
  if (!message.member.hasPermission('MANAGE_MESSAGES')) return
  if (!args[0]) return message.reply('Вы не указaли роль')
  let i = 0

  const nameFromArgs = args[0]

  args[1] = 'basic'

  const isBasic = args[1] === 'basic' ? true : false
  const delIfAnother = args[2] === 'delIfAnother' ? true : false
  const role = message.guild.roles.cache.find(
    r => r.name.toLowerCase() === nameFromArgs.toLowerCase()
  )
  if (!role) return message.reply(`Role ${nameFromArgs} is not found`)

  if (!isBasic)
    message.guild.members.cache
      .filter(
        m =>
          !m.user.bot &&
          !m.roles.cache.find(r => r.name.toLowerCase() === nameFromArgs.toLowerCase())
      )
      .forEach(async member => {
        member.roles.add(role)
        i++
      })
  else if (delIfAnother)
    message.guild.members.cache
      .filter(m => !m.user.bot)
      .forEach(async member => {
        if (member.roles.cache.size < 2) member.roles.add(role)
        if (
          member.roles.cache.size > 2 &&
          member.roles.cache.find(r => r.name === nameFromArgs)
        )
          member.roles.remove(role)
        i++
      })
  else
    message.guild.members.cache
      .filter(m => !m.user.bot && m.roles.cache.size < 2)
      .forEach(async member => {
        member.roles.add(role)
        i++
      })

  message.reply(`${i} людям была выдана роль ${role.name}`)
  log(`${message.author.username}(${message.member}) set role ${role.name} ${i} users`)
  return i
}

module.exports.help = {
  name: 'setRoleEveryone',
}
