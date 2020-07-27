const { Temp, TempTypes } = require('../models/Temp')
const { Guild } = require('../models/Guild')
const { User } = require('../models/User')

module.exports.start = async () => {
  setInterval(async () => {
    const temps = await Temp.find({})
    temps.forEach(item => {
      const timeToDeadline = item.deadline - Date.now()
      if (timeToDeadline > 3600 * 1000) return
      switch (item.type) {
        case TempTypes.GUILD_DELETE:
          setTimeout(() => {
            Guild.deleteOne({ id: item.options.id })
            User.deleteMany({ guildId: item.options.id })
          }, Math.max(0, timeToDeadline))
          break
        case TempTypes.USER_DELETE:
          setTimeout(() => {
            User.deleteOne({ id: item.options.id, guildId: item.options.guildId })
          }, Math.max(0, timeToDeadline))
          break
      }
    })
  }, 3600 * 1000)
}
