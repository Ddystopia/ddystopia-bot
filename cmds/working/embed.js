const log = require('../../utils/log.js')
module.exports.run = async (client, message, args) => {
  if (!message.member.hasPermission('MANAGE_MESSAGES')) return
  if (!args[0] || !args[1]) return
  if (!args[0].match(/(\d{15,})/)) return
  const channel = message.guild.channels.cache.get(args[0].match(/(\d{15,})/)[1])
  if (!channel) return
  try {
    const messageData = message.content.match(/{.+}/)[0]
    const embedObj = JSON.parse(messageData)

    embedObj.author = {
      name: message.author.username,
      icon_url: message.author.avatarURL(),
      url: 'https://discord.js.org',
    }

    channel.send({
      embed: embedObj,
		})
		log(`${message.author.username}(${message.member}) send embed`)
  } catch (err) {
    return message.reply(`${err.name}: ${err.message}`)
  }
}

module.exports.help = {
  name: 'embed',
}
