const { User } = require('../../models/User')

module.exports.run = async (message, [propSum]) => {
  if (!message.member.hasPermission('MANAGE_MESSAGES')) return
  if (isNaN(+propSum) && propSum !== '-all') return
  if (!message.mentions.users.first()) return

  const tillId = message.mentions.users.first().id
  if (!tillId) return
  const user = await User.getOrCreate(tillId, message.guild.id)

  const transaction = propSum === '-all' ? -user.coins : +propSum
  user.coins += transaction

  user.save()
  message.reply(`Было успешно переведено ${transaction} ${global.currency}`)
}

module.exports.help = {
  name: 'reward',
}
