const { Temp, TempTypes } = require('../models/Temp')

module.exports.getCallback = () => async member => {
  new Temp({
    type: TempTypes.USER_DELETE,
    options: { id: member.id, guildId: member.guild.id, deadline: 5 * 24 * 3600 * 1000 },
  }).save()
}

module.exports.event = 'guildMemberRemove'
