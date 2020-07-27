const { User } = require('../../models/User')
const { log } = require('../../utils/log.js')

module.exports.run = async (message, [newLevel]) => {
  if (!message.member.hasPermission('MANAGE_MESSAGES')) return
  if (!message.mentions.users.first()) return
  if (isNaN(+newLevel) || +newLevel < 0) return
  const user = await User.getOrCreate(message.mentions.users.first().id, message.guild.id)
  user.level = +newLevel
  user.xp = 0
  user.save()
  log(
    `${message.member.tag}set ${newLevel} level for user ${
      message.mentions.members.first().tag
    }`
  )

  message.reply('✅')
}

module.exports.help = {
  name: 'level',
}
