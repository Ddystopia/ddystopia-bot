const { User } = require('../../models/User')

module.exports.run = async message => {
  const user = await User.getOrCreate(message.author.id, message.guild.id)
  if (!user.loot[':tickets:']) return message.reply('У вас нет лута :tickets:')
  user.removeLoot([':tickets:'])

  const [name] = message.content.match(/(?<=\[)(.+?)(?=])/) || []
  const color = `#${message.content.match(/[\dabsdef]{6}/)[0]}`

  if (!name || name.length < 1 || name.length > 40 || !/#[\dabsdef]{6}/.test(color))
    return message.reply('Неправильные аргументы')

  message.guild.roles
    .create({
      data: {
        name,
        color,
        position: message.guild.me.roles.highest.position,
        mentionable: true,
      },
      reason: 'Покупка',
    })
    .then(role => {
      message.member.roles.add(role)
      message.react('✅')
    })
    .catch(() => {
      message.react('❌')
      message.reply('Что-то пошло не так... Билет не вернём.')
    })
}

module.exports.help = {
  name: 'selfrole',
  cooldown: 5,
  aliases: ['sr'],
}
