const { appendFile } = require('fs')
const path = require('path')
module.exports = log => {
  appendFile(
    path.join(__dirname, '..', 'logs.log'),
    `${log} at ${new Date().toJSON()} \n`,
    err => err && console.error(err)
  )
}
