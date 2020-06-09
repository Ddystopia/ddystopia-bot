const Discord = module.require('discord.js')
const fs = require('fs')
const randomInteger = require('../utils/randomInteger.js')
let game = null
let tmpCounter = 0
let everyone

class Game {
  constructor(number, client) {
    this.roles = {}
    this.roles.mafias = number >= 10 ? Math.floor(number / 3) - 1 : Math.floor(number / 3)
    this.roles.doctors = number >= 8 ? (number >= 12 ? 2 : 1) : 0
    this.roles.dons = number >= 10 ? 1 : 0
    this.roles.sherifs = number >= 16 ? 2 : 1
    this.roles.peaceful =
      number -
      this.roles.mafias -
      this.roles.doctors -
      this.roles.dons -
      this.roles.sherifs
    this.aliveNumber = number
    this.corpses = []
    this.players = new Map()
    this.votes = {}
    this.votedPlayers = new Set()
    this.vote = false

    this._mafiasChannel = client.guilds.cache
      .get('402105109653487627')
      .channels.cache.get('696716921785286686')
  }

  get mafiasChannel() {
    return this._mafiasChannel
  }

  async night() {
    this.voiceChannel.members.forEach(item => item.voice.setMute(true))

    const embed = new Discord.MessageEmbed()
      .setColor('#84ed39')
      .setTitle(`Night start`)
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/402109825896415232/692820764478668850/yummylogo.jpg'
      )
      .setTimestamp()
    this.channel.send(embed)
    const list = this.createList()
    let donsId
    if (this.players.dons)
      donsId = this.players.dons[0] ? this.players.dons[0].user.id : null
    const mafias = this.players.get('mafias')
    const permissionsNight = mafias.map(item => {
      return {
        id: item.user.id,
        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
      }
    })
    if (donsId)
      permissionsNight.push({
        id: donsId,
        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
      })
    permissionsNight.push({
      id: everyone,
      deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
    })
    this.mafiasChannel
      .overwritePermissions(permissionsNight)
      .catch(err => console.error(err))

    await timeout(60 * 1000)
    //========================================================================================================
    this.mafiasChannel.send(list)
    this.vote = true
    //========================================================================================================
    await timeout(30 * 1000)

    this.mafiasChannel.send('Vote is end')
    let toKill = Object.entries(this.votes)[0]
      ? +Object.entries(this.votes).sort((a, b) => b[1] - a[1])[0][0]
      : null
    tmpCounter = 0
    this.votedPlayers = new Set()
    this.votes = {}
    this.vote = false
    const permissionsDay = mafias.map(item => {
      return {
        id: item.user.id,
      }
    })
    if (donsId)
      permissionsNight.push({
        id: donsId,
        deny: ['SEND_MESSAGES'],
        allow: ['VIEW_CHANNEL'],
      })
    permissionsDay.push({
      id: everyone,
      deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
    })
    this.mafiasChannel
      .overwritePermissions(permissionsDay)
      .catch(err => console.error(err))

    mafias.map(item => ({
      id: item.user.id,
    }))
    this.mafiasChannel.overwritePermissions()

    //========================================================================================================
    if (this.players.get('doctors')) {
      this.players.get('doctors').forEach(item => item.user.send(list))
      this.vote = true
      //========================================================================================================
      await timeout(15 * 1000)
      const toHeal = Object.entries(this.votes).map(item => item[1])
      Object.entries(this.votes).forEach(item =>
        item[0] ? item[0].send('Vote is end') : null
      )
      tmpCounter = 0
      this.votedPlayers = new Set()
      this.votes = {}
      this.vote = false
      if (!toHeal.includes(toKill) && toKill) {
        this.corpses.push(this.alivePlayers[toKill + 1].member)
        this.aliveNumber--
      }
    }

    //========================================================================================================
    this.players.get('sherifs').forEach(item => item.user.send(list))
    this.vote = true
    //========================================================================================================
    await timeout(20 * 1000)

    const toCheck = Object.entries(this.votes)
    toCheck.forEach(item =>
      item[0] ? item[0].send(this.alivePlayers[item[1] + 1].role) : null
    )
    Object.entries(this.votes).forEach(item =>
      item[0] ? item[0].send('Vote is end') : null
    )
    tmpCounter = 0
    this.votedPlayers = new Set()
    this.votes = {}
    this.vote = false
    //========================================================================================================
    if (this.players.get('dons')) {
      this.players.get('dons').forEach(item => item.user.send(list))
      this.vote = true
      //========================================================================================================
      await timeout(20 * 1000)

      const toDonCheck = Object.entries(this.votes)
      toDonCheck.forEach(item =>
        item[0] ? item[0].send(this.alivePlayers[item[1] + 1].role) : null
      )
      Object.entries(this.votes).forEach(item =>
        item[0] ? item[0].send('Vote is end') : null
      )
      tmpCounter = 0
      this.votedPlayers = new Set()
      this.votes = {}
      this.vote = false
    }
    return this.day(this.checkWinner())
  }
  async day(winner) {
    if (winner) return this.win(winner)
    const embed = new Discord.MessageEmbed()
      .setColor('#84ed39')
      .setTitle(`Day start`)
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/402109825896415232/692820764478668850/yummylogo.jpg'
      )
      .setTimestamp()
    this.channel.send(embed)
    this.channel.overwritePermissions(permissionsDay).catch(err => console.error(err))

    await this.voiceChannel.members.forEach(item =>
      !this.corpses.includes(item) ? item.voice.setMute(false) : null
    )
    this.channel.send(this.createList(true))
    await timeout(3 * 60 * 1000)
    //========================================================================================================
    this.channel.send(this.createList())
    this.vote = true
    await timeout(30 * 1000)
    this.channel.send('Vote is end')
    let toKill = Object.entries(this.votes)[0]
      ? +Object.entries(this.votes).sort((a, b) => b[1] - a[1])[0][0] + 1
      : null
    this.votedPlayers = new Set()
    this.votes = {}
    this.vote = false
    const username =
      this.alivePlayers[toKill].member.nickname ||
      this.alivePlayers[toKill].member.user.username
    this.channel.send(`${username} has been killed`)
    winner = this.checkWinner()
    if (winner) return this.win(winner)
    else this.night()
  }
  async win(winner) {
    const embed = new Discord.MessageEmbed()
      .setColor('#84ed39')
      .setTitle(`${winner} is winner`)
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/402109825896415232/692820764478668850/yummylogo.jpg'
      )
      .setTimestamp()
    this.channel.send(embed)
    await this.voiceChannel.members.forEach(item => item.voice.setMute(false))

    this.players.get(winner).forEach(item => {
      let profile
      try {
        profile = require(__dirname.replace(/cmds$/, '') +
          `profiles/${item.user.id}.json`)
      } catch (err) {
        profile = {
          coins: 0,
          resentDaily: Date.now() - 1000 * 60 * 60 * (24 + 1),
        }
      }
      profile.coins += 5000
      fs.writeFile(
        __dirname.replace(/cmds$/, '') + `profiles/${item.user.id}.json`,
        JSON.stringify(profile),
        err => (err ? console.log(err) : null)
      )
    })
    game = null
  }

  checkWinner() {
    if (this.players.get('mafias').length >= Math.round(this.aliveNumber / 2))
      return 'mafias'
    else if (this.players.get('mafias').length <= 0) return 'peaceful'
    else return false
  }

  createList(bool = false) {
    const list = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(bool ? 'Corpses' : 'Players')
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/402109825896415232/692820764478668850/yummylogo.jpg'
      )
      .setTimestamp()
    this.alivePlayers = {}
    let i = 1
    if (bool)
      for (let corpse of this.corpses) {
        list.addField(i++, corpse.nickname || corpse.user.username)
      }
    else
      for (let player of this.players.entries()) {
        console.log(player)
        player[1].forEach(item => {
          if (this.corpses.includes(item)) return
          list.addField(i++, item.nickname || item.user.username)
          this.alivePlayers[i] = { role: player[0], member: item }
        })
      }
    tmpCounter = bool ? 0 : i
    return list
  }
}

class Commands {
  static start(message, client) {
    if (game) return message.reply('Game already exists')
    const voiceChannel = message.guild.channels.cache.get('696716971441520721')
    if (voiceChannel.members.size < 6) return message.reply('So few peoples')
    const number = voiceChannel.members.size
    game = new Game(number, client)
    game.voiceChannel = voiceChannel
    game.channel = message.guild.channels.cache.find(ch => ch.id == '698840428191154228')
    const tmpRoles = Object.entries(game.roles)

    game.voiceChannel.members.forEach(item => {
      let role
      let roleIndex
      do {
        roleIndex = randomInteger(0, 4)
        role = tmpRoles[roleIndex]
      } while (role[1] <= 0)
      tmpRoles[roleIndex][1]--

      item.user.send(role[0])
      let rolePlayers = game.players.get(role[0]) || []
      rolePlayers.push(item)
      game.players.set(role[0], rolePlayers)
    })
    game.night(game.voiceChannel, client)
  }

  static vote(message, args) {
    if (isNaN(+args[1])) return
    if (+args[1] > tmpCounter) return
    if (game.votedPlayers.has(message.author.id)) return
    if (!game.vote) return

    if (message.channel.type == 'dm') game.votes[message.author] = +args[0]
    else {
      if (game.votes[+args[1]]) game.votes[+args[1]]++
      else game.votes[+args[1]] = 1
    }

    game.votedPlayers.add(message.author.id)
    message.react('✔')
  }

  static async end() {
    if (!game) return
    await game.voiceChannel.members.forEach(item => item.voice.setMute(false))
    game.channel
      .overwritePermissions([
        {
          id: everyone,
          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
        },
      ])
      .catch(err => console.error(err))
    game.mafiasChannel
      .overwritePermissions([
        {
          id: everyone,
          deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
        },
      ])
      .catch(err => console.error(err))
    game = null
    tmpCounter = 0
    this.votedPlayers = new Set()
    this.votes = {}
    this.vote = false
  }
}

module.exports.run = async (client, message, args) => {
  everyone = message.guild.roles.everyone
  switch (args[0]) {
    case 'start':
      Commands.start(message, client)
      break
    case 'vote':
      Commands.vote(message, args)
      break
    case 'end':
      Commands.end(message, args)
      break
    default:
      message.reply("I don't know this command")
  }
}

module.exports.help = {
  name: 'mafia',
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
