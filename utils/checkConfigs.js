const { accessSync } = require('fs')
module.exports.checkAndExit = () => {
  try {
    accessSync('.env')
    accessSync('redditConfig.json')
  } catch (err) {
    console.error('You must create .evv and redditConfig.json')
    process.exit()
  }
}
