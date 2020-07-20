const { MessageEmbed } = require('discord.js')
const { rainbow } = require('../../utils/rainbow')
const CHANNEL_ID = '703642165108146218'

module.exports.run = async (message, args) => {
  const ideaChannel = message.guild.channels.cache.get(CHANNEL_ID)
  if (!ideaChannel) return
  const embed = new MessageEmbed()
    .setThumbnail(message.author.avatarURL())
    .setTitle('Новая идея!')
    .setDescription(args.join(' '))
    .setFooter(`${message.author.tag} • ${new Date().toLocaleDateString()}`)
    .setColor(rainbow())

  ideaChannel.send(embed).catch(err => message.reply(`Some error: ${err.message}`))
  message.react('✅')
}

module.exports.help = {
  name: 'idea',
  aliases: ['идея', 'предожение'],
}
