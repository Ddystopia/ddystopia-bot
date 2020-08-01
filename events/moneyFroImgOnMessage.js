const { Guild } = require('../models/Guild')

module.exports.getCallback = client => async message => {
  if (!message.guild) return
  const { imageChannels } = await Guild.getOrCreate(message.guild.id)
  if (imageChannels.includes(message.channel.id) && !message.author.bot)
    client.commands.get('increaseMoneyForImage'.toLowerCase()).run(message)
}
