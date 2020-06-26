const fs = require('fs')
const path = require('path')

const write = (path, file) =>
  fs.writeFileSync(
    path,
    JSON.stringify(file).replace(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3})Z/, '$1'),
    err => err && console.error(err)
  )

module.exports = (filePathProp, file, initial) => {
  let response = null
  const filePath = path.join(__dirname, '..', filePathProp)
  try {
    response = require(filePath)
    if (file) write(filePath, file)
  } catch (err) {
    write(filePath, initial || {})
    response = initial || {}
  }
  return response
}
