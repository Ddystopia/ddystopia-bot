const fs = require('fs')
const initial = {
  coins: 0,
  rep: 0,
  loot: {},
  birthday: null,
  marry: null,
  about: '',
  timers: {
    daily: 0,
    loot: 0,
    rep: 0,
  },
}

const write = (path, file) =>
  fs.writeFileSync(path, JSON.stringify(file), err => err && console.error(err))

module.exports.file = (filePathProp, file, initial) => {
  let response = null
  const filePath = `${__dirname.replace(/utils$/, '')}${filePathProp}`
  try {
    response = require(filePath)
    if (file) write(filePath, file)
  } catch (err) {
    write(filePath, initial || {})
    response = initial || {}
  }
  return response
}

module.exports.profile = (id, file) => {
  let response = null
  const filePath = `${__dirname.replace(/utils$/, '')}profiles/${id}.json`
  try {
    response = require(filePath)
    response.timers = {
      daily: response.resentDaily || response.timers.daily,
      loot: (response.timers && response.timers.loot) || 0,
      rep: (response.timers && response.timers.rep) || 0,
    }
		response.loot = response.loot || {}
		response.rep = response.rep || 0
    delete response.resentDaily
    if (file) write(filePath, file)
  } catch (err) {
    write(filePath, initial)
    response = initial
  }
  return response
}
