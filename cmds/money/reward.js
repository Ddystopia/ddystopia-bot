const { appendFile } = require('fs')
const readWrite = require('../../utils/readWriteFile')

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

  appendFile(
    __dirname.replace(/cmds.+$/, '') + `transactionLogs.log`,
    `REWARD from${message.author.username} till ${
      message.mentions.users.first().username
    } - ${transaction} coins\n`,
    err => err && console.error(err)
  )

  message.reply(`Было успешно переведено ${transaction} ${currency}`)
}

module.exports.help = {
  name: 'reward',
}
