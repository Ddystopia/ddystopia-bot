const { appendFile } = require('fs')
const { join: joinPath } = require('path')
module.exports.log = log => {
  if (log instanceof Error) console.error(log)
  appendFile(
    joinPath(__dirname, '..', 'logs.log'),
    `${log} at ${new Date().toJSON()} \n`,
    err => err && console.error(err)
  )
}
