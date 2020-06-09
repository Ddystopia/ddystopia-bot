const fs = require('fs')
const initial = {
  coins: 0,
  resentDaily: Date.now() - 1000 * 60 * 60 * (24 + 1),
}

const write = (path, file) =>
  fs.writeFileSync(path, JSON.stringify(file), err => err && console.error(err))

module.exports.file = (filePathProp, file) => {
  let response
  const filePath = `${__dirname.replace(/utils$/, '')}profiles/${filePathProp}`
  try {
    response = require(filePath)
    if (file) write(filePath, file)
  } catch (err) {
    write(filePath, {})
    response = require(filePath)
  }
  return response
}

module.exports.profile = (id, file) => {
  let response = null
  const filePath = `${__dirname.replace(/utils$/, '')}profiles/${id}.json`
  try {
    response = require(filePath)
    if (file) write(filePath, file)
  } catch (err) {
    write(filePath, initial)
    response = require(filePath)
  }
  return response
}
