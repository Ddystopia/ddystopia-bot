const { MessageEmbed } = require('discord.js')
const { rainbow } = require('../../utils/rainbow')
const { Guild } = require('../../models/Guild')

module.exports.run = async (message, args) => {
  const { ideaChannelId } = await Guild.findOne({ id: message.guild.id })
  const ideaChannel = message.guild.channels.cache.get(ideaChannelId)

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
