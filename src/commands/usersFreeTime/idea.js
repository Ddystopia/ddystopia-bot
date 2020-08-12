const { MessageEmbed } = require('discord.js')
const { Guild } = require('../../models/Guild')
const { rainbow } = require('../../utils/rainbow')

module.exports.run = async (message, args) => {
  const { ideaChannel: id } = await Guild.findOne({ id: message.guild.id })
  const ideaChannel = message.guild.channels.cache.get(id)

  if (!ideaChannel) return
  const embed = new MessageEmbed()
    .setThumbnail(message.author.avatarURL())
    .setTitle('Новая идея!')
    .setDescription(args.join(' '))
    .setFooter(`${message.author.tag} • ${new Date().toLocaleDateString()}`)
    .setColor(rainbow())

  ideaChannel.send(embed).catch(err => message.reply(`Some error: ${err.message}`))
  message.react('✅')
  message.delete({ time: 0 })
}

module.exports.help = {
  name: 'idea',
  aliases: ['идея', 'предожение'],
}
