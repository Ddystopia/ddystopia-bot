const { appendFile } = require('fs')
const readWrite = require('../../utils/readWriteFile')

module.exports.run = async (client, message, args) => {
  if (!args) return
  if (isNaN(+args[0])) return
  if (+args[0] <= 0 || +args[0] > 1e4) return
  if (!args[1]) return
  if (!args[1].match(/(\d{15,})/)) return

  const fromId = message.author.id
  const tillId = message.mentions.users.first().id
  if (!tillId) return
  const profileFrom = readWrite.profile(fromId)
  const profileTill = readWrite.profile(tillId)

  const transaction = args[0] == 'all' ? profileFrom.coins : +args[0]

  if (profileFrom.coins < transaction) return message.reply(`Не хватает ${currency}`)

  profileFrom.coins -= transaction
  profileTill.coins += transaction

  readWrite.profile(fromId, profileFrom)
  readWrite.profile(tillId, profileTill)

  appendFile(
    __dirname.replace(/cmds.+$/, '') + `transactionLogs.log`,
    `GIVE from ${message.author.username} till ${
      message.mentions.users.first().username
    } - ${transaction} coins\n`,
    err => (err ? console.log(err) : null)
  )

  message.reply(`Было успешно переведено ${transaction} ${currency}`)
}

module.exports.help = {
  name: 'give',
}
