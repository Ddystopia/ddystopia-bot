const mongoose = require('mongoose')
const { performance } = require('perf_hooks')

const CitiesGameWord = mongoose.model(
  'CitiesGameWord',
  mongoose.Schema({
    word: String,
    channelId: String,
    date: {
      type: Number,
      default: () => performance.timeOrigin + performance.now(),
    },
  })
)
module.exports.CitiesGameWord = CitiesGameWord
