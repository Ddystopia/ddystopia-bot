module.exports.run = async message => {
  message.reply(`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(3)}mb`)
}

module.exports.help = {
  name: 'memory',
}
