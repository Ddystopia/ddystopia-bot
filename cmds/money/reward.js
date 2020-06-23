const readWrite = require('../../utils/readWriteFile')
const log = require('../../utils/log.js')

module.exports.run = async (client, message, args) => {
  if (!message.member.hasPermission('MANAGE_MESSAGES')) return
  if (!args) return
  if (isNaN(+args[0]) && args[0] !== '-all') return
  if (!args[1]) return

  const tillId = message.mentions.users.first().id
  if (!tillId) return
  const profileTill = readWrite.profile(tillId)

  const transaction = args[0] === '-all' ? -profileTill.coins : +args[0]
  profileTill.coins += transaction

  readWrite.profile(tillId, profileTill)

  log(
    `REWARD from${message.author.username} till ${
      message.mentions.users.first().username
    } - ${transaction} coins`
  )

  message.reply(`Было успешно переведено ${transaction} ${currency}`)
}

module.exports.help = {
  name: 'reward',
}
