const { User } = require('../../models/User')
const MAX_GIVE_SUM_ONE_TIMES = 1e4

module.exports.run = async (message, [sum, memberString]) => {
  if (isNaN(+sum)) return
  if (+sum <= 0 || +sum > MAX_GIVE_SUM_ONE_TIMES) return
  if (memberString && !memberString.match(/(\d{15,})/)) return

  const fromId = message.author.id
  const tillId = memberString.match(/(\d{15,})/)
  if (!tillId) return
  const profileFrom = await User.getOrCreate(fromId, message.guild.id)
  const profileTill = await User.getOrCreate(tillId, message.guild.id)
  if (profileTill.bankrupt) return

  const transaction = sum === 'all' ? profileFrom.coins : +sum

  if (profileFrom.coins < transaction)
    return message.reply(`Не хватает ${global.currency}`)

  profileFrom.coins -= transaction
  profileTill.coins += transaction

  profileFrom.save()
  profileTill.save()

  message.reply(`Было успешно переведено ${transaction} ${global.currency}`)
}

module.exports.help = {
  name: 'give',
}
