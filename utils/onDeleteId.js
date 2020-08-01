const { Guild } = require('../models/Guild')

module.exports.onDelete = async item => {
  const guildDB = await Guild.getOrCreate(item.guild.id)

  for (const prop in guildDB) {
    if (guildDB[prop] === item.id) {
      guildDB[prop] = null
      guildDB.markModified(prop)
    }
    if (Array.isArray(guildDB[prop]) && guildDB[prop].includes(item.id)) {
      guildDB[prop] = guildDB[prop].filter(el => el !== item.id)
      guildDB.markModified(prop)
    }
  }
  guildDB.save()
}
