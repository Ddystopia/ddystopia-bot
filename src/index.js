if (!process.env.FROM_DOCKER_COMPOSE) require('dotenv').config()
require('./utils/checkTemps.js').start()
require('./utils/mongoose.js').init()

const { Client, Collection } = require('discord.js')
const { readdirSync, writeSync } = require('fs')
const { log } = require('./utils/log.js')
const { resolve, join } = require('path')

global.currency = '🌱' //если язык русский, то в родительском падеже(кого? чего?)
const client = new Client()
client.commands = new Collection()
client.intervals = new Collection()
client.timeouts = new Collection()

readdirSync(resolve(__dirname, './events/'))
  .filter(f => f.endsWith('.js'))
  .forEach((f, i, jsFiles) => {
    const { getCallback, event } = require(`./events/${f}`)
    client.on(event, getCallback(client))

    if (jsFiles.length === i + 1)
      console.log(`${jsFiles.length} event listeners have been loaded`)
  })

readdirSync(resolve(__dirname, './commands/')).forEach(dir => {
  const jsFiles = readdirSync(join(__dirname, './commands/', dir)).filter(f =>
    f.endsWith('.js')
  )
  jsFiles.forEach((f, i) => {
    const props = require(`./commands/${dir}/${f}`)
    if (props.help.aliases)
      props.help.aliases = props.help.aliases.map(alias => alias.toLowerCase())
    client.commands.set(props.help.name.toLowerCase(), props)

    if (jsFiles.length === i + 1)
      console.log(`${jsFiles.length} files in module [${dir}] have been loaded`)
  })
})

process.on('uncaughtException', (err, origin) => {
  const errContent = `Caught exception: ${err}\nException origin: ${origin}`
  writeSync(process.stderr.fd, errContent)
  log(errContent)
  console.log('Boom')
  console.error(errContent)
})

client.login(process.env.TOKEN)
