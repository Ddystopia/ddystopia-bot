module.exports.run = async (client, message, args) => {
  if (
    !message.member.roles.cache.has('691736168693497877') && //Модератор
    !message.member.roles.cache.has('606932311606296624') && //Администратор
    !message.member.roles.cache.has('657964826852589609') //Главный администратор
  )
    return
  if (!args[0] || !args[1]) return
  if (!args[0].match(/(\d{15,})/)) return
  const channel = message.guild.channels.cache.get(args[0].match(/(\d{15,})/)[1])
  if (!channel) return
  try {
    const messageData = message.content.replace(`>embed ${args[0]}`, '').trim()
    const embedObj = JSON.parse(messageData)

    embedObj.author = {
      name: message.author.username,
      icon_url: message.author.avatarURL(),
      url: 'https://discord.js.org',
    }

    channel.send({
      embed: embedObj,
    })
  } catch (err) {
    return message.reply(`${err.name}: ${err.message}`)
  }
}

module.exports.help = {
  name: 'embed',
}
