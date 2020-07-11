const { MessageEmbed } = require('discord.js')
const { rainbow } = require('../../utils/rainbow')

module.exports.run = async (message, args) => {
  const embed = new MessageEmbed()
    .setThumbnail(message.author.avatarURL())
    .setTitle('Новая идея!')
    .setDescription(args.join(' '))
    .setFooter(
      `${message.member.displayName}#${
        message.author.discriminator
      } • ${new Date().toLocaleDateString()}`
    )
    .setColor(rainbow())
  message.guild.channels.cache
    .get('703642165108146218')
    .send(embed)
    .catch(err => message.reply(`Some error: ${err.message}`))
  message.react('✅')
}

module.exports.help = {
  name: 'idea',
  aliases: ['идея', 'предожение'],
}
