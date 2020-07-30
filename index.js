require('dotenv').config()
const { Client, Collection } = require('discord.js')
const { Leveling } = require('./classes/Leveling.js')
const { Guild } = require('./models/Guild.js')
const { Temp, TempTypes } = require('./models/Temp.js')
const { readdirSync, statSync, writeSync } = require('fs')
const { log } = require('./utils/log.js')
const { User } = require('./models/User.js')
const { clearInterval } = require('timers')
const { RoleForShop } = require('./models/RoleForShop.js')
const { RoleForLeveling } = require('./models/RoleForLeveling.js')
require('./utils/checkTemps.js').start()
require('./utils/mongoose.js').init()
const MAX_GUILD_MEMBERS_COUNT_TO_IMMEDIATELY_DELETE_ON_LEAVE = 100
const HOURS_TO_CALC_PERCENTS = 12

const client = new Client()
global.currency = '🌱' //если язык русский, то в родительском падеже(кого? чего?)
client.commands = new Collection()
client.intervals = new Collection()
client.timeouts = new Collection()

const getDirs = p => readdirSync(p).filter(f => statSync(`${p}${f}`).isDirectory())
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

client.on('ready', async () => {
  console.log(`Запустился бот ${client.user.username}`)
  const guilds = await Guild.find({})

  guilds.forEach(async guildDB => {
    const guild = client.guilds.cache.get(guildDB.id)
    if (!guild) return await Guild.deleteOne({ id: guildDB.id })

    Leveling.voiceLeveling(guild.channels)

    guildDB.wordsGameChannels.forEach(async id => {
      const channel = guild.channels.cache.get(id)
      client.commands
        .get('cities')
        .run({ channel, onReady: true, guild: { id: guildDB.id } }, ['start'])
    })

    let intervals = client.intervals.get(guild.id)
    let timeouts = client.timeouts.get(guild.id)
    if (!intervals) {
      intervals = []
      client.intervals.set(guild.id, intervals)
    }
    if (!timeouts) {
      timeouts = []
      client.timeouts.set(guild.id, timeouts)
    }
    intervals.push(
      setInterval(() => {
        if (new Date().getHours() === HOURS_TO_CALC_PERCENTS - 1)
          timeouts.push(
            setTimeout(() => {
              client.commands.get('bank').run({ guild }, 'calcPercents')
            }, new Date().setHours(HOURS_TO_CALC_PERCENTS, 0, 0, 0) - Date.now())
          )

        client.commands.get('bank').run({ guild }, 'closeDeals')
      }, 3600 * 1000)
    )
  })
})

client.on('guildCreate', async guild => {
  if (!client.intervals.has(guild.id)) client.intervals.set(guild.id, [])
  if (!client.timeouts.has(guild.id)) client.timeouts.set(guild.id, [])
  const admins = guild.members.cache.filter(m => m.hasPermission('ADMINISTRATOR'))
  admins.forEach(m => {
    m.user
      .send(
        `Здравствуйте! Извините, что беспокою, но не могли бы вы ознакомится с тем, как настроить меня для вашего чудесного сервера?
Сделать вы это можете, введя комманду help у себя на сервере, и пролистав до последней страницы. Обычно, мой префикс "${process.env.PREFIX}", но вы можете его поменять в любую минуту!
Спасибо вам, что пригласили меня на такой животрепещий сервер.`
      )
      .catch(() => {})
  })
})

client.on('guildDelete', async guild => {
  const timeouts = client.timeouts.get(guild.id) || []
  const intervals = client.intervals.get(guild.id) || []
  timeouts.forEach(clearTimeout)
  intervals.forEach(clearInterval)

  if (guild.memberCount < MAX_GUILD_MEMBERS_COUNT_TO_IMMEDIATELY_DELETE_ON_LEAVE) {
    await Guild.deleteOne({ id: guild.id })
    return await User.deleteMany({ guildId: guild.id })
  }
  new Temp({ type: TempTypes.GUILD_DELETE, options: { id: guild.id } }).save()
})

client.on('guildMemberAdd', async member => {
  const { greetingChannel, baseRole } = await Guild.getOrCreate(member.guild.id)
  if (!greetingChannel || member.user.bot) return
  const role = member.guild.roles.cache.get(baseRole)
  if (!member || !role) return
  member.roles.add(role)
  client.commands.get('greeting').run({ member }, [greetingChannel])
})

client.on('guildMemberRemove', async member => {
  new Temp({
    type: TempTypes.USER_DELETE,
    options: { id: member.id, guildId: member.guild.id, deadline: 5 * 24 * 3600 * 1000 },
  }).save()
})
const onDelete = async item => {
  const guildDB = await Guild.getOrCreate(item.guild.id)

  for (const prop in guildDB) {
    if (guildDB[prop] === item.id) {
      guildDB[prop] = null
      guildDB.markModified(prop)
    }
    if (Array.isArray(guildDB[prop]) && guildDB[prop].includes(item.id)) {
      guildDB[prop] = guildDB[prop].filter(el => el !== item.id)
      guildDB.markModified(prop)
    }
  }
  guildDB.save()
}
client.on('roleDelete', async role => {
  await RoleForShop.deleteMany({ id: role.id })
  await RoleForLeveling.deleteMany({ id: role.id })
  onDelete(role)
})
client.on('channelDelete', onDelete)

client.on('message', message => {
  if (!message.author.bot && message.guild) Leveling.textLeveling(message.member)
})
client.on('message', async message => {
  if (!message.guild) return
  const { imageChannels } = await Guild.getOrCreate(message.guild.id)
  if (imageChannels.includes(message.channel.id) && !message.author.bot)
    client.commands.get('increaseMoneyForImage'.toLowerCase()).run(message)
})
client.on('message', async message => {
  if (!message.guild) return
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
    command.run(message, args, commandName).catch(log)
  }
})

process.on('uncaughtException', (err, origin) => {
  const errContent = `Caught exception: ${err}\nException origin: ${origin}`
  writeSync(process.stderr.fd, errContent)
  log(errContent)
  console.log(errContent)
})

client.login(process.env.TOKEN)
