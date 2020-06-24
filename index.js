const { Client, Collection } = require('discord.js')
const client = new Client()
const fs = require('fs')
const readWrite = require('./utils/readWriteFile')
const log = require('./utils/log.js')
const randomInteger = require('./utils/randomInteger.js')
const calcXp = require('./utils/calcXp.js')

const nonGrata = ['464804290876145665', '266259546236911618']
const imageChannels = ['402109720833425408', '402114219438374913']
const bannedChannels = ['649336430350303243', '501430596971790346', '402105109653487629']
const wordsGameChannels = ['714961392427466763']

const { token, prefix } = require('./config.json')
global.currency = '🌱' //если язык русский, то в родительском падеже(кого? чего?)

client.commands = new Collection()

const leveling = {
  _XP_TIME: 2,
  _XP_MUL: 15,
  _users: new Collection(),

  _calcLeveling(newExp, id) {
    const profile = readWrite.profile(id)
    if (!profile.xp) profile.xp = 0
    profile.xp += randomInteger(newExp, newExp + 7 * this._XP_TIME)
    let xp = calcXp(profile.level) // xp for up
    while (profile.xp >= xp) {
      profile.xp -= xp
      profile.level++
      xp = calcXp(profile.level) // xp for up
    }
    readWrite.profile(id, profile)
  },

  textLeveling(id) {
    if (!this._users.has(id)) this._users.set(id, Date.now())
    let userTime = (Date.now() - this._users.get(id)) / 1000 / 60 // To minutes
    if (userTime < this._XP_TIME) return

    const newExp = Math.floor(this._XP_TIME * this._XP_MUL)
    this._calcLeveling(newExp, id)
    this._users.set(id, Date.now())
  },

  voiceLeveling(channels) {
    setInterval(() => {
      channels.cache
        .filter(channel => channel.type === 'voice')
        .each(channel => {
          const members = channel.members.filter(
            member => !member.voice.mute && !member.voice.deaf
          )
          members.each(member => {
            const newExp = 6 * (members.size - 1)
            this._calcLeveling(newExp, member.id)
          })
        })
    }, 60 * 1000)
  },
}

const getDirs = p => {
  return fs.readdirSync(p).filter(f => fs.statSync(`${p}${f}`).isDirectory())
}

getDirs('./cmds/').forEach(dir => {
  fs.readdir(`./cmds/${dir}`, (err, files) => {
    if (err) return console.error(err)

    let jsFiles = files.filter(f => f.split('.').pop() === 'js')
    if (!jsFiles.length) return console.error(`Ошибка загрузки модуля [${dir}]`)
    console.log(`${jsFiles.length} files in module [${dir}] have been loaded`)

    jsFiles.forEach((f, i) => {
      const props = require(`./cmds/${dir}/${f}`)
      if (props.help.cmdList)
        for (let name of props.help.aliases) client.commands.set(name, props)
      else client.commands.set(props.help.name, props)
    })
  })
})

client.on('ready', async () => {
  console.log(`Запустился бот ${client.user.username}`)
  const channels = client.guilds.cache.get('402105109653487627').channels

  leveling.voiceLeveling(channels)

  wordsGameChannels.forEach(async id => {
    const channel =
      channels.cache.get(id) ||
      (await channels.fetch(id).catch(() => log(`Can\'t fetch channel with id ${id}`)))
    client.commands.get('cities').run(client, { channel, onReady: true }, ['start'])
  })

  checkTrigger()

  function checkTrigger() {
    const info = require('./workingInfo.json')
    if (Date.now() - info.lastCalcDate > 24 * 3600 * 1000) {
      client.commands.get('bank').run(client, true, 'calcPercents')
      info.lastCalcDate = Date.now()
      readWrite.file('workingInfo.json', info)

      log('Percents have been calked')
    }
    client.commands.get('bank').run(client, true, 'setBancrots')
    setTimeout(checkTrigger, 30 * 60 * 1000)
  }

  setInterval(() => console.log('Ok'), 30 * 60 * 1000)
})

client.on('message', message => {
  leveling.textLeveling(message.author.id)
})
client.on('message', message => {
  if (imageChannels.includes(message.channel.id))
    client.commands.get('increaseMoneyForImage').run(client, message)
})

client.on('message', async message => {
  if (bannedChannels.includes(message.channel.id)) return // do not listening commands from banned channels
  if (!message.content.startsWith(prefix)) return // filter simple text
  if (nonGrata.includes(message.author.id) || message.author.bot) return

  const args = message.content.split(/\s+/g)
  const commandName = args.shift().toLowerCase().slice(prefix.length)
  const command = client.commands.get(commandName)

  if (command) command.run(client, message, args, commandName)
})

client.on('guildMemberAdd', member => {
  const role = member.guild.roles.cache.find(r => r.name === 'Яммик')
  if (!member || !role) return log('Role or member do not exist')
  member.roles.add(role)
  client.commands.get('greeting').run(client, member)
})

client.login(token)
