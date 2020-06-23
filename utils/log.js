const { appendFile } = require('fs')
module.exports = log => {
  appendFile(
    __dirname.replace(/utils$/, '') + `logs.log`,
    `${log} at ${new Date().toJSON()} \n`,
    err => (err ? console.error(err) : null)
  )
}
