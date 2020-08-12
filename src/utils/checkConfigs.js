const { accessSync } = require('fs')
const path = require('path')
module.exports.checkAndExit = () => {
  try {
    accessSync(path.join(__dirname, '..', '..', '.env'))
    accessSync(path.join(__dirname, '..', '..', 'redditConfig.json'))
  } catch (err) {
    console.error('You must create .env and redditConfig.json')
    process.exit()
  }
}
