const mongoose = require('mongoose')

const RoleForShop = mongoose.model(
  'RoleForShop',
  mongoose.Schema({
    id: String,
    cost: Number,
    guildId: String,
  })
)

module.exports.RoleForShop = RoleForShop
