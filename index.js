const { Client, Collection } = require('discord.js')
const { Leveling } = require('./classes/Leveling.js')
const { Guild } = require('./models/Guild.js')
const { readdirSync, statSync, writeSync } = require('fs')
const { log } = require('./utils/log.js')
require('dotenv').config()
require('./utils/mongoose.js').init()
const client = new Client()

global.currency = '🌱' //если язык русский, то в родительском падеже(кого? чего?)
client.commands = new Collection()
client.login(process.env.TOKEN)

const getDirs = p => readdirSync(p).filter(f => statSync(`${p}${f}`).isDirectory())
getDirs('./cmds/').forEach(dir => {
  const jsFiles = readdirSync(`./cmds/${dir}`).filter(f => f.endsWith('.js'))
  jsFiles.forEach((f, i) => {
    const props = require(`./cmds/${dir}/${f}`)
    if (props.help.aliases)
      props.help.aliases = props.help.aliases.map(alias => alias.toLowerCase())
    client.commands.set(props.help.name.toLowerCase(), props)

    if (jsFiles.length === i + 1)
      console.log(`${jsFiles.length} files in module [${dir}] have been loaded`)
  })
})

client.on('ready', async () => {
  console.log(`Запустился бот ${client.user.username}`)
  const guilds = await Guild.find({})
  guilds.forEach(guildDB => {
    const guild = client.guilds.cache.get(guildDB.id)
    if (!guild) Guild.deleteOne({ id: guildDB.id })

    Leveling.voiceLeveling(guild.channels)

    guildDB.wordsGameChannels.forEach(async id => {
      const channel = guild.channels.cache.get(id)
      client.commands.get('cities').run({ channel, onReady: true }, ['start'])
    })

    guild.setInterval(() => {
      if (new Date().getHours() === 11)
        guild.setTimeout(() => {
          client.commands.get('bank').run({ guild }, 'calcPercents')
          log('Percents have been calked')
        }, new Date().setHours(12, 0, 0, 0) - Date.now())

      client.commands.get('bank').run({ guild }, 'closeDeals')
    }, 60 * 60 * 1000)
  })
})

client.on('message', message => {
  !message.author.bot && Leveling.textLeveling(message.member)
})
client.on('message', async message => {
  const { imageChannels } = await Guild.getOrCreate(message.guild.id)
  if (imageChannels.includes(message.channel.id) && !message.author.bot)
    client.commands.get('increaseMoneyForImage'.toLowerCase()).run(message)
})
client.on('message', async message => {
  const guildDB = await Guild.getOrCreate(message.guild.id)
  if (guildDB.noCommandsChannels.includes(message.channel.id)) return // do not listening commands from banned channels
  if (!message.content.startsWith(guildDB.prefix)) return // filter simple text
  if (guildDB.blacklist.includes(message.author.id) || message.author.bot) return

  const args = message.content.split(/\s+/g)
  const commandName = args.shift().toLowerCase().slice(guildDB.prefix.length)
  const command =
    client.commands.get(commandName) ||
    client.commands.find(({ help }) => help.aliases && help.aliases.includes(commandName))

  if (command) {
    log(`User ${message.author.tag} use command [${commandName}] with args [${args}]`)
    command.run(message, args, commandName).catch(log)
  }
})

client.on('guildMemberAdd', async member => {
  const { greetingChannel, baseRoleId } = await Guild.getOrCreate(member.guild.id)
  if (!greetingChannel) return
  const role = member.guild.roles.cache.get(baseRoleId)
  if (!member || !role) return log('Role or member do not exist')
  member.roles.add(role)
  client.commands.get('greeting').run({ member }, [greetingChannel])
})

process.on('uncaughtException', (err, origin) => {
  const errContent = `Caught exception: ${err}\nException origin: ${origin}`
  writeSync(process.stderr.fd, errContent)
  log(errContent)
  console.log(errContent)
})
