const { MessageEmbed } = require('discord.js')
const client = require('nekos.life')
const { sfw } = new client()
// prettier-ignore
const actions = ['smug','baka','tickle','slap','poke','pat','neko','nekoGif','meow','lizard','kiss','hug','foxGirl','feed','cuddle','kemonomimi','holo','woof','wallpaper','goose','gecg','avatar','waifu']

const { rainbow } = require('../../utils/rainbow')

function getAction(actionProps, actions) {
  const action = actions.find(el => el.toLowerCase() === actionProps.toLowerCase())
  return sfw[action]()
}

module.exports.run = async (message, args, command) => {
  const responseMessage = message.mentions.users.size
    ? `${message.member} ${command} ${message.mentions.users.first()}`
    : `${message.member} ${command}`

  const urlObj = await getAction(command, actions)
  const embed = new MessageEmbed()
    .setColor(rainbow())
    .setImage(urlObj.url)
    .setFooter(urlObj.url)
  message.channel.send(responseMessage, embed)
}

module.exports.help = {
  name: 'hug',
  cooldown: 2,
  aliases: actions,
}
