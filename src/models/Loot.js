const mongoose = require('mongoose')

const Loot = mongoose.model(
  'Loot',
  mongoose.Schema({
    loot: String,
    cost: Number,
    guildId: String,
  })
)
module.exports.Loot = Loot
