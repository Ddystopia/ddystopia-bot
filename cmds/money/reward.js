const { appendFile } = require('fs')
const readWrite = require('../../utils/readWriteFile')

module.exports.run = async (client, message, args) => {
  if (
    !message.member.roles.cache.has('691736168693497877') && //Модератор
    !message.member.roles.cache.has('606932311606296624') && //Администратор
    !message.member.roles.cache.has('657964826852589609') //Главный администратор
  )
    return
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

  message.reply(`Было успешно переведено ${transaction} монет`)
}

module.exports.help = {
  name: 'reward',
}