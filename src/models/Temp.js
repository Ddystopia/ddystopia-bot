const mongoose = require('mongoose')
const DEFAULT_MILLISECONDS_DEADLINE = 1 * 30 * 24 * 3600 * 1000

const TempTypes = Object.freeze({
  GUILD_DELETE: 0,
  USER_DELETE: 1,
})

const schema = mongoose.Schema({
  type: Number,
  options: Object,
  deadline: { type: Number, default: () => Date.now() + DEFAULT_MILLISECONDS_DEADLINE },
})

const Temp = mongoose.model('Temp', schema)
module.exports.Temp = Temp
module.exports.TempTypes = TempTypes
