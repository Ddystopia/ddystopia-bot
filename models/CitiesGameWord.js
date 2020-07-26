const mongoose = require('mongoose')

const CitiesGameWord = mongoose.model(
  'CitiesGameWord',
  mongoose.Schema({
    word: String,
    guildId: String,
    date: {
      type: Number,
      default: global.performance.timeOrigin + global.performance.now(),
    },
  })
)
module.exports.CitiesGameWord = CitiesGameWord
