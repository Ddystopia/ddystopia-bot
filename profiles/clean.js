const { readdir, unlinkSync } = require('fs')
readdir(__dirname, (err, files) => {
  files.filter(f => f.split('.').length !== 2).forEach(f => unlinkSync(__dirname + '/' + f))
})
