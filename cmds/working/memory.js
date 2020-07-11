const { MessageEmbed } = require('discord.js')
const { rainbow } = require('../../utils/rainbow')

module.exports.run = async message => {
  const memoryUsage = process.memoryUsage()
  const embed = new MessageEmbed()
    .setColor(rainbow())
    .setTitle('Memory Usage')
    .setTimestamp()
  for (const item in memoryUsage)
    embed.addField(item, `${memoryUsage[item] / 1024 / 1024}mb`)
  message.reply(embed)
}

module.exports.help = {
  name: 'memory',
}
