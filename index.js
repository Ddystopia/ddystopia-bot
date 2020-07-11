const { Client, Collection } = require('discord.js')
const { Leveling } =require('./classes/Leveling.js')
const client = new Client()
const { readdirSync, statSync } = require('fs')
const { log } = require('./utils/log.js')

const nonGrata = ['464804290876145665', '266259546236911618']
const imageChannels = ['402109720833425408', '402114219438374913']
const bannedChannels = ['649336430350303243', '501430596971790346', '402105109653487629']
const wordsGameChannels = ['714961392427466763']

const { token, prefix } = require('./config.json')
global.currency = '🌱' //если язык русский, то в родительском падеже(кого? чего?)

client.commands = new Collection()

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
  const guild = client.guilds.cache.get('402105109653487627')

  Leveling.voiceLeveling(guild.channels)

  wordsGameChannels.forEach(async id => {
    const channel =
      guild.channels.cache.get(id) ||
      (await guild.channels
        .fetch(id)
        .catch(() => log(`Can't fetch channel with id ${id}`)))
    client.commands.get('cities').run({ channel, onReady: true }, ['start'])
  })

  checkTrigger()
  function checkTrigger() {
    if (new Date().getHours() === 11)
      setTimeout(() => {
        client.commands.get('bank').run({ guild }, 'calcPercents')
        log('Percents have been calked')
      }, new Date().setHours(12, 0, 0, 0) - Date.now())

    client.commands.get('bank').run({ guild }, 'closeDeals')
    setTimeout(checkTrigger, 60 * 60 * 1000)
  }
})

client.on('message', message => {
  Leveling.textLeveling(message.author.id)
})
client.on('message', message => {
  if (imageChannels.includes(message.channel.id))
    client.commands.get('increaseMoneyForImage'.toLowerCase()).run(message)
})
client.on('message', async message => {
  if (bannedChannels.includes(message.channel.id)) return // do not listening commands from banned channels
  if (!message.content.startsWith(prefix)) return // filter simple text
  if (nonGrata.includes(message.author.id) || message.author.bot) return

  const args = message.content.split(/\s+/g)
  const commandName = args.shift().toLowerCase().slice(prefix.length)
  const command =
    client.commands.get(commandName) ||
    client.commands.find(({ help }) => help.aliases && help.aliases.includes(commandName))

  if (command) {
    log(
      `User ${message.member.displayName}(${message.member}) use command [${commandName}] with args [${args}]`
    )
    command.run(message, args, commandName).catch(log)
  }
})

client.on('guildMemberAdd', member => {
  const role = member.guild.roles.cache.find(r => r.name === 'Яммик')
  if (!member || !role) return log('Role or member do not exist')
  member.roles.add(role)
  client.commands.get('greeting').run({ member })
})

client.login(token)
