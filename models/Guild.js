const mongoose = require('mongoose')

const guildSchema = mongoose.Schema({
  id: String,
  prefix: { type: String, default: process.env.PREFIX },
  logChannel: { type: String, default: '' },
  ideaChannel: { type: String, default: '' },
  baseRole: { type: String, default: '' },
  bankruptRole: { type: String, default: '' },
  greetingChannel: { type: String, default: '' },
  blacklist: { type: [String], default: [] },
  imageChannels: { type: [String], default: [] },
  noCommandsChannels: { type: [String], default: [] },
  wordsGameChannels: { type: [String], default: [] },
})
// not arrow func because context 'this' is important
guildSchema.statics.getOrCreate = async function (id) {
  let guild = await this.findOne({ id })
  if (!guild) {
    guild = new Guild({ id })
    guild.save()
  }
  return guild
}

const Guild = mongoose.model('Guild', guildSchema)
module.exports.Guild = Guild
