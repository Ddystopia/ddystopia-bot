const User = require('../../classes/User')
const log = require('../../utils/log.js')

module.exports.run = async (client, message, args) => {
  if (!args) return
  if (isNaN(+args[0])) return
  if (+args[0] <= 0 || +args[0] > 1e4) return
  if (!args[1]) return
  if (!args[1].match(/(\d{15,})/)) return

  const fromId = message.author.id
  const tillId = message.mentions.users.first().id
  if (!tillId) return
  const profileFrom = User.getOrCreateUser(fromId)
  const profileTill = User.getOrCreateUser(tillId)
  if (profileTill.bancrot) return

  const transaction = args[0] == 'all' ? profileFrom.coins : +args[0]

  if (profileFrom.coins < transaction) return message.reply(`Не хватает ${currency}`)

  profileFrom.coins -= transaction
  profileTill.coins += transaction

  profileFrom.save()
  profileTill.save()

  log(
    `GIVE from ${message.author.username} till ${
      message.mentions.users.first().username
    } - ${transaction} coins`
  )

  message.reply(`Было успешно переведено ${transaction} ${currency}`)
}

module.exports.help = {
  name: 'give',
}
