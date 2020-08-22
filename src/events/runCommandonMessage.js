const { Guild } = require('../models/Guild')
const { Collection } = require('discord.js')
const { log } = require('../utils/log')
const cooldowns = new Collection()

module.exports.getCallback = client => async message => {
  if (!message.guild) return
  const guildDB = await Guild.getOrCreate(message.guild.id)

  if (guildDB.noCommandsChannels.includes(message.channel.id)) return // do not listening commands from banned channels
  if (!message.content.startsWith(guildDB.prefix)) return // filter simple text
  if (guildDB.blacklist.includes(message.author.id) || message.author.bot) return
  const args = message.content.split(/ +/g)
  const commandName = args.shift().toLowerCase().slice(guildDB.prefix.length)
  const command =
    client.commands.get(commandName) ||
    client.commands.find(({ help }) => help.aliases && help.aliases.includes(commandName))

  if (command) {
    if (command.help.needAdminRights && !message.guild.me.hasPermission('ADMINISTRATOR'))
      return message.reply('Для этой команды мне необходимы права администратора...')

    const { isLeft, timeLeft } = getCooldown(command, message.author.id)
    if (!isLeft)
      return message.reply(
        `подождите пожалуста ${timeLeft.toFixed(2)} секунд (защита от спама)`
      )

    command.run(message, args, commandName).catch(log)
  }
}

module.exports.event = 'message'

const getCooldown = ({ help }, userId) => {
  if (!cooldowns.has(help.name)) cooldowns.set(help.name, new Collection())
  const now = Date.now()
  const timestamps = cooldowns.get(help.name)
  const cooldownAmount = (help.cooldown || 1) * 1000

  if (!timestamps.has(userId)) timestamps.set(userId, now - cooldownAmount)

  const expirationTime = timestamps.get(userId) + cooldownAmount

  const timeLeft = (expirationTime - now) / 1000
  const isLeft = expirationTime <= now

  if (isLeft) timestamps.set(userId, now)
  return { timeLeft, isLeft }
}
