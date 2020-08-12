const { Guild } = require('../models/Guild')
const { User } = require('../models/User')
const { Temp, TempTypes } = require('../models/Temp')
const MAX_GUILD_MEMBERS_COUNT_TO_IMMEDIATELY_DELETE_ON_LEAVE = 100

module.exports.getCallback = client => async guild => {
  const timeouts = client.timeouts.get(guild.id) || []
  const intervals = client.intervals.get(guild.id) || []
  timeouts.forEach(clearTimeout)
  intervals.forEach(clearInterval)

  if (guild.memberCount < MAX_GUILD_MEMBERS_COUNT_TO_IMMEDIATELY_DELETE_ON_LEAVE) {
    await Guild.deleteOne({ id: guild.id })
    return await User.deleteMany({ guildId: guild.id })
  }
  new Temp({ type: TempTypes.GUILD_DELETE, options: { id: guild.id } }).save()
}

module.exports.event = 'guildDelete'
