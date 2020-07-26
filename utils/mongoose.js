const mongoose = require('mongoose')
module.exports.init = () => {
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
  mongoose.Promise = global.Promise
}
