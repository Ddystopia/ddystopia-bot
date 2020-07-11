const { User } = require('../../classes/User')
const { log } = require('../../utils/log.js')

module.exports.run = async (message, args) => {
  if (!message.member.hasPermission('MANAGE_MESSAGES')) return
  if (!message.mentions.users.first()) return
  if (isNaN(+args[0]) || +args[0] < 0) return
  const user = await User.getOrCreateUser(message.mentions.users.first().id)
  user.level = +args[0]
  user.xp = 0
  user.save()
  log(
    `${message.member.displayName}(${message.member}) set ${args[0]} level for user ${
      message.mentions.members.first().displayName
    }`
  )

  message.reply('✅')
}

module.exports.help = {
  name: 'level',
}
