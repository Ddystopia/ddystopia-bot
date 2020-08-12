const mongoose = require('mongoose')

const RoleForLeveling = mongoose.model(
  'RoleForLeveling',
  mongoose.Schema({
    id: String,
    level: String,
    guildId: String,
  })
)

module.exports.RoleForLeveling = RoleForLeveling
