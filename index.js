require('./utils/checkConfigs.js').checkAndExit()

require('dotenv').config()
require('./utils/checkTemps.js').start()
require('./utils/mongoose.js').init()

const { Client, Collection } = require('discord.js')
const { readdirSync, statSync, writeSync } = require('fs')
const { log } = require('./utils/log.js')

global.currency = '🌱' //если язык русский, то в родительском падеже(кого? чего?)
const client = new Client()
client.commands = new Collection()
client.intervals = new Collection()
client.timeouts = new Collection()

const getDirs = p => readdirSync(p).filter(f => statSync(`${p}${f}`).isDirectory())

readdirSync('./events/')
  .filter(f => f.endsWith('.js'))
  .forEach((f, i, jsFiles) => {
    const { getCallback, event } = require(`./events/${f}`)
    client.on(event, getCallback(client))

    if (jsFiles.length === i + 1)
      console.log(`${jsFiles.length} event listeners have been loaded`)
  })

getDirs('./commands/').forEach(dir => {
  const jsFiles = readdirSync(`./commands/${dir}`).filter(f => f.endsWith('.js'))
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
