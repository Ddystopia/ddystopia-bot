module.exports.run = async (message, args) => {
  if (!message.member.hasPermission('MANAGE_MESSAGES')) return
  if (!args[0]) return message.reply('Вы не указaли роль')
  let i = 0

  const [nameFromArgs] = message.content.match(/(?<=\[)(.+?)(?=])/) || []

  const isBasic = args[1] === 'basic' ? true : false
  const delIfAnother = args[2] === 'delIfAnother' ? true : false
  const role = message.guild.roles.cache.find(
    r => r.name.toLowerCase() === nameFromArgs.toLowerCase()
  )
  if (!role) return message.reply(`Role ${nameFromArgs} is not found`)
  if (role.position >= message.guild.me.roles.highest.position)
    return message.reply('Извините, но эта роль слишком крута для простых смертных.')

  const members = await message.guild.members.fetch()
  if (!isBasic)
    members
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
    members
      .filter(m => !m.user.bot)
      .forEach(async member => {
        if (member.roles.cache.size < 2) member.roles.add(role)
        if (member.roles.cache.size > 2) member.roles.remove(role)
        i++
      })
  else
    members
      .filter(m => !m.user.bot && m.roles.cache.size < 2)
      .forEach(async member => {
        member.roles.add(role)
        i++
      })

  message.reply(`${i} людям была выдана роль ${role.name}`)
  return i
}

module.exports.help = {
  name: 'setRoleEveryone',
  cooldown: 60,
  aliases: ['ste'],
}
