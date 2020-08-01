const { Leveling } = require('../classes/Leveling')

module.exports.getCallback = () => message => {
  if (!message.author.bot && message.guild) Leveling.textLeveling(message.member)
}

module.exports.event = 'message'
