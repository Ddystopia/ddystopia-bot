const { MessageEmbed } = require('discord.js')
const { User } = require('../../classes/User')

module.exports.run = async (message, args) => {
  let userId
  try {
    userId = args[0] ? message.mentions.users.first().id : message.author.id
  } catch (err) {
    return message.reply("I don't know who is it")
  }

  const user = await User.getOrCreateUser(userId)

  const embed = new MessageEmbed()
    .setColor('#0099ff')
    .addField('Расчёт', `На счету ${Math.floor(user.coins)} ${currency}`)
  message.reply(embed)
}

module.exports.help = {
  name: 'money',
  aliases: ['$', 'balance'],
}
