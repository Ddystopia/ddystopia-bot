module.exports.run = async message => {
  message.channel.send(`Pong! пинг бота: \`${Math.floor(message.client.ws.ping)}ms\``)
}

module.exports.help = {
  name: 'ping',
  aliases: ['пинг'],
}
