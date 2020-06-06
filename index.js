const Discord = require('discord.js')
const client = new Discord.Client()
const fs = require('fs')

const nonGrata = ['464804290876145665']
const imageChannels = ['402109720833425408', '402114219438374913']
const bannedChannels = [
  '649336430350303243',
  '501430596971790346',
  '402105109653487629',
]
const wordsGameChannels = ['714961392427466763']

const { token, prefix } = require('./config.json')

client.commands = new Discord.Collection()

fs.readdir('./cmds/', (err, files) => {
  if (err) throw new Error(err)
  const jsFiles = files.filter((f) => f.split('.').pop() === 'js')
  if (jsFiles.length <= 0) throw new Error('No files to download')
  console.log(`${jsFiles.length} commands have been loaded`)
  jsFiles.forEach((f, i) => {
    const props = require(`./cmds/${f}`)
    client.commands.set(props.help.name, props)
    console.log(`${i + 1}. ${f} has been loaded`)
  })
})

client.on('ready', () => {
  console.log(`Запустился бот ${client.user.username}`)
  checkTrigger()

  function checkTrigger() {
    const info = require('./workingInfo.json')
    if (Date.now() - info.lastCalcDate > 24 * 3600 * 1000) {
      client.commands.get('bank').run(client, true, 'calcParcents')
      info.lastCalcDate = Date.now()
      fs.writeFile(
        `${__dirname}/workingInfo.json`,
        JSON.stringify(info),
        (err) => (err ? console.error(err) : null)
      )
      console.log('Percents have been calced')
      console.log(new Date())
    }
    client.commands.get('bank').run(client, true, 'setBancrots')
    console.log('Okey')
    console.log(new Date())
    setTimeout(checkTrigger, 30 * 60 * 1000)
  }
})

client.on('message', async (message) => {
  if (bannedChannels.includes(message.channel.id)) return
  if (imageChannels.includes(message.channel.id))
    client.commands.get('increaseMoneyForImage').run(client, message)
  if (
    wordsGameChannels.includes(message.channel.id) &&
    !message.content.startsWith(prefix)
  )
    return client.commands.get('cities').run(client, message, null)
  if (!message.content.startsWith(prefix)) return
  if (message.content.startsWith(prefix + ' ')) return
  if (message.content.length < 3) return

  if (nonGrata.includes(message.author.id)) return
  if (message.author.bot) return

  fs.access(`profiles/${message.author.id}.json`, fs.constants.F_OK, (err) => {
    if (!err) return
    const profile = {
      coins: 0,
      resentDaily: Date.now() - 1000 * 60 * 60 * (24 + 1),
    }
    fs.writeFile(
      `${__dirname}/profiles/${message.author.id}.json`,
      JSON.stringify(profile),
      (err) => (err ? console.log(err) : null)
    )
  })

  const messageArray = message.content.split(/\s+/g)
  const command = messageArray.shift().toLowerCase().slice(prefix.length)
  const args = messageArray
  const cmd = client.commands.get(command)
  if (command === 'help') return message.reply('Закреп')
  //'694199268847648813' - bank channel id
  if (
    command.startsWith('bank_') &&
    message.channel.id === '694199268847648813'
  )
    return client.commands.get('bank').run(client, message, command, args)

  setTimeout(() => {
    if (cmd) cmd.run(client, message, args)
    else message.reply('You need to enter a valid command!')
  }, 350)
})

client.on('guildMemberAdd', (member) => {
  const role = member.guild.roles.cache.find((r) => r.name === 'Яммик')
  if (!member || !role) return
  member.roles.add(role)
  client.commands.get('greeting').run(client, member)
})
client.login(token)
