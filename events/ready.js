const { Guild } = require('../models/Guild')
const { Leveling } = require('../classes/Leveling')

const HOURS_TO_CALC_PERCENTS = 12

module.exports.getCallback = client => async () => {
  console.log(`Запустился бот ${client.user.username}`)
  const guilds = await Guild.find({})

  guilds.forEach(async guildDB => {
    const guild = client.guilds.cache.get(guildDB.id)
    if (!guild) return await Guild.deleteOne({ id: guildDB.id })

    Leveling.voiceLeveling(guild.channels)

    guildDB.wordsGameChannels.forEach(async id => {
      const channel = guild.channels.cache.get(id)
      client.commands
        .get('cities')
        .run({ channel, onReady: true, guild: { id: guildDB.id } }, ['start'])
    })

    let intervals = client.intervals.get(guild.id)
    let timeouts = client.timeouts.get(guild.id)
    if (!intervals) {
      intervals = []
      client.intervals.set(guild.id, intervals)
    }
    if (!timeouts) {
      timeouts = []
      client.timeouts.set(guild.id, timeouts)
    }
    intervals.push(
      setInterval(() => {
        if (new Date().getHours() === HOURS_TO_CALC_PERCENTS - 1)
          timeouts.push(
            setTimeout(() => {
              client.commands.get('bank').run({ guild }, 'calcPercents')
            }, new Date().setHours(HOURS_TO_CALC_PERCENTS, 0, 0, 0) - Date.now())
          )

        client.commands.get('bank').run({ guild }, 'closeDeals')
      }, 3600 * 1000)
    )
  })
}

module.exports.event = 'ready'
