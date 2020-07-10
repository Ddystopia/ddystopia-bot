const { MessageEmbed } = require('discord.js')
const rainbow = require('../../utils/rainbow')

module.exports.run = async (message, args) => {
  const embed = new MessageEmbed()
    .setAuthor(
      message.member.displayName,
      message.author.avatarURL(),
      'https://discord.js.org'
    )
    .setThumbnail(
      'https://cdn.discordapp.com/attachments/402109825896415232/692820764478668850/yummylogo.jpg'
    )
    .setTitle('Idea')
    .addField('\u200B', args.join(' '))
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
