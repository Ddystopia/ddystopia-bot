const { MessageEmbed } = require('discord.js')
const { User } = require('../../models/User')

module.exports.run = async message => {
  const userId = message.mentions.users.first()
    ? message.mentions.users.first().id
    : message.author.id

  const user = await User.getOrCreate(userId, message.guild.id)

  const embed = new MessageEmbed()
    .setColor(0x0099ff)
    .addField('Расчёт', `На счету ${Math.floor(user.coins)} ${global.currency}`)
  message.reply(embed)
}

module.exports.help = {
  name: 'money',
  aliases: ['$', 'balance'],
}
