const Discord = module.require('discord.js')
const fs = require('fs')
const profiles = require(__dirname.replace(/cmds$/, '') + 'bank_profiles.json')
const latesCredites = new Map()

class User {
  constructor(userId) {
    this.credit = null
    this.deposit = null
    this.id = userId
  }
  createCredit(sum, days) {
    if (this.credit) return 'You already have credit.'
    if (isNaN(+sum) || isNaN(+days)) return 'Invalid arguments'
    if (+sum > 1e5) return 'Invalid argument sum(so many)'
    if (+days > 4) return 'Invalid argument days(so many)'
    if (+sum < 5e4 && +days > 2) return 'So many days on this sum'

    const profile = require(__dirname.replace(/cmds$/, '') + `profiles/${this.id}.json`)
    if (sum < 1000) 'Invalid argument sum(so few)'
    if (sum / profile.coins > 15 && profile.coins > 200)
      return `On this sum you must have more then ${+(sum / 15).toFixed(3)} coins`

    latesCredites.set(this.id, Date.now() + 3 * 3600 * 1000)
    const percent = Math.max(-((Math.E * 6) ** (sum / 1e4) - 55), -(sum / 1e4 - 1) * 5 + 25, 15)
    this.credit = new Credit(sum, days, percent, this.id)
    return true
  }
  createDeposit(sum, days) {
    if (this.deposit) return 'You already have deposit.'
    if (this.credit) return "You have some credit, I can't make deposit."
    if (isNaN(+sum) || isNaN(+days)) return 'Invalid arguments'
    if (+sum < 500) return 'Too small sum'
    if (+days < 5) return 'Too few days'
    if (+days > 100) return 'Too many days'

    const percent =
      Math.min((Math.E ** 6) ** (days / 10) / 3, (days / 10 - 1) * 6.5 + 15, 20) / 2.35
    this.deposit = new Deposit(sum, days, percent, this.id)
    return true
  }
}

class Deal {
  constructor(sum, days, percent) {
    this.sum = (+sum * percent) / 100 + +sum
    this.deadline = Date.now() + days * 24 * 3600 * 1000
    this.percent = percent
  }
}

class Deposit extends Deal {
  constructor(sum, days, percent, userId) {
    super(sum, days, percent)
    const profile = require(__dirname.replace(/cmds$/, '') + `profiles/${userId}.json`)

    if (this.sum > profile.coins) {
      this.sum = profile.coins
      profile.coins = 0
    } else profile.coins -= +sum

    fs.writeFile(
      __dirname.replace(/cmds$/, '') + `profiles/${userId}.json`,
      JSON.stringify(profile),
      err => (err ? console.log(err) : null)
    )
  }
  repay(sum, userId) {
    const profile = require(__dirname.replace(/cmds$/, '') + `profiles/${userId}.json`)
    if (profiles[userId].credit) return 'You already have a credit.'
    if (isNaN(+sum)) return

    if (sum > profile.coins) {
      sum = profile.coins
      profile.coins = 0
    } else profile.coins -= +sum

    this.sum += +sum

    fs.writeFile(
      __dirname.replace(/cmds$/, '') + `profiles/${userId}.json`,
      JSON.stringify(profile),
      err => (err ? console.log(err) : null)
    )
    return true
  }
  payDeposites(userId) {
    const profile = require(__dirname.replace(/cmds$/, '') + `profiles/${userId}.json`)
    profile.coins += Math.floor(+this.sum)
    profiles[userId].deposit = null
    fs.writeFile(
      __dirname.replace(/cmds$/, '') + `profiles/${userId}.json`,
      JSON.stringify(profile),
      err => (err ? console.log(err) : null)
    )
  }
}

class Credit extends Deal {
  constructor(sum, days, percent, userId) {
    super(sum, days, percent)
    const profile = require(__dirname.replace(/cmds$/, '') + `profiles/${userId}.json`)
    profile.coins += +sum
    fs.writeFile(
      __dirname.replace(/cmds$/, '') + `profiles/${userId}.json`,
      JSON.stringify(profile),
      err => (err ? console.log(err) : null)
    )
  }
  repay(sum, userId) {
    const profile = require(__dirname.replace(/cmds$/, '') + `profiles/${userId}.json`)
    if (isNaN(+sum)) return
    if (latesCredites.has(userId)) {
      if (latesCredites.get(userId) < Date.now()) latesCredites.delete(userId)
      else return 'Подождите немного'
    }
    if (sum > profile.coins) {
      sum = profile.coins
      profile.coins = 0
    } else profile.coins -= +sum

    this.sum -= +sum
    if (this.sum <= 0) profiles[userId].credit = null
    fs.writeFile(
      __dirname.replace(/cmds$/, '') + `profiles/${userId}.json`,
      JSON.stringify(profile),
      err => (err ? console.error(err) : null)
    )
    return true
  }
  badUser(userId, client, rec) {
    const profile = require(__dirname.replace(/cmds$/, '') + `profiles/${userId}.json`)
    if (rec) makeBancrot()
    else {
      this.sum *= 1.5
      this.sum -= profile.coins + (profiles[userId].deposit ? profiles[userId].deposit.sum : 0)
      profile.coins = 0
      if (this.sum > 0) makeBancrot()

      profiles[userId].credit = null
      profiles[userId].deposit = null
      console.log('New Bancrot: ' + userId)
    }
    fs.writeFile(
      __dirname.replace(/cmds$/, '') + 'bank_profiles.json',
      JSON.stringify(profiles),
      err => (err ? console.error(err) : null)
    )
    fs.writeFile(
      __dirname.replace(/cmds$/, '') + `profiles/${userId}.json`,
      JSON.stringify(profile),
      err => (err ? console.error(err) : null)
    )

    function makeBancrot() {
      profile.coins = 0
      profiles[userId].bancrot = Date.now() + 7 * 12 * 3600 * 1000
      //402105109653487627 - server id
      const member = client.guilds.cache.get('402105109653487627').members.cache.get(userId)
      if (!member) return
      const role = member.guild.roles.cache.find(r => r.name === 'Банкрот')
      member.roles.add(role)
      const roles = require(__dirname.replace(/cmds$/, '') + `roles.json`)
      for (const roleId in roles) {
        if (!roles.hasOwnProperty(roleId)) continue
        const role = member.guild.roles.cache.get(roleId)
        if (member.roles.cache.has(role.id)) member.roles.remove(role)
      }
    }
  }
}

class ModerationCommands {
  static setBancrots(client) {
    for (const userId in profiles) {
      if (!profiles.hasOwnProperty(userId)) continue
      const element = profiles[userId]
      Object.setPrototypeOf(element.credit || {}, Credit.prototype)
      Object.setPrototypeOf(element.deposit || {}, Deposit.prototype)
      if (element.credit)
        if (element.credit.deadline <= Date.now()) element.credit.badUser(element.id, client)

      if (element.deposit)
        if (element.deposit.deadline <= Date.now()) element.deposit.payDeposites(element.id)

      const member = client.guilds.cache.get('402105109653487627').members.cache.get(`${userId}`)
      if (member) {
        const role = member.guild.roles.cache.find(r => r.name === 'Банкрот')
        if (element.bancrot < Date.now()) {
          element.bancrot = null
          member.roles.remove(role)
        } else if (element.bancrot && !member.roles.cache.has(role.id)) {
          Credit.prototype.badUser(userId, client, true)
        }
      }
      fs.writeFile(
        __dirname.replace(/cmds$/, '') + 'bank_profiles.json',
        JSON.stringify(profiles),
        err => (err ? console.error(err) : null)
      )
    }
  }

  static calcPercents(client) {
    for (const userId in profiles) {
      if (!profiles.hasOwnProperty(userId)) continue
      const element = profiles[userId]
      if (element.credit) element.credit.sum += (element.credit.sum * element.credit.percent) / 100
      if (element.deposit)
        element.deposit.sum += (element.deposit.sum * element.deposit.percent) / 100
    }
    fs.writeFile(
      __dirname.replace(/cmds$/, '') + 'bank_profiles.json',
      JSON.stringify(profiles),
      err => (err ? console.error(err) : null)
    )
  }

  static remove(message, args) {
    if (
      !message.member.roles.cache.has('691736168693497877') && //Модератор
      !message.member.roles.cache.has('606932311606296624') && //Администратор
      !message.member.roles.cache.has('657964826852589609') //Главный администратор
    )
      return
    const user = message.mentions.users.first()
    if (!user) return "I don't know who is it"
    switch (args[1]) {
      case 'credit':
        profiles[user.id].credit = null
        break
      case 'deposit':
        profiles[user.id].deposit = null
        break
      case 'bancrot':
        profiles[user.id].bancrot = null
        const role = message.guild.roles.cache.find(r => r.name === 'Банкрот')
        message.guild.members.cache.get(user.id).roles.remove(role)
        break
      default:
        return "I don't know this property"
    }
    return true
  }
}

module.exports.run = async (client, message, args) => {
  if (args === 'calcPercents') return ModerationCommands.calcPercents(client) //inclusion
  if (args === 'setBancrots') return ModerationCommands.setBancrots(client) //inclusion
  if (message.channel.id !== '694199268847648813') return
  fs.access(`profiles/${message.author.id}.json`, fs.constants.F_OK, err => {
    if (!err) return
    const profile = {
      coins: 0,
      resentDaily: Date.now() - 1000 * 60 * 60 * (24 + 1),
    }
    fs.writeFile(`${__dirname}/profiles/${message.author.id}.json`, JSON.stringify(profile), err =>
      err ? console.log(err) : null
    )
  })

  const userId = message.author.id

  if (!profiles[userId]) profiles[userId] = new User(userId)
  //set prototypes after JSON
  Object.setPrototypeOf(profiles[userId], User.prototype)
  Object.setPrototypeOf(profiles[userId].credit || {}, Credit.prototype)
  Object.setPrototypeOf(profiles[userId].deposit || {}, Deposit.prototype)

  let response
  switch (args[0]) {
    case 'create':
      if (args[1] === 'credit')
        //prettier ignore
        response = profiles[userId].createCredit(args[2], args[3], userId)
      else if (args[1] === 'deposit')
        response = profiles[userId].createDeposit(args[2], args[3], userId)
      if (typeof response === 'string') message.reply(response)
      else message.react('✅')
      break
    case 'repay':
      if (args[1] === 'credit') {
        if (!profiles[userId].credit) return message.reply("You don't have a credit")
        response = profiles[userId].credit.repay(args[2], userId)
      } else if (args[1] === 'deposit') {
        if (!profiles[userId].deposit) return message.reply("You don't have a deposit")
        response = profiles[userId].deposit.repay(args[2], userId)
      }
      if (typeof response === 'string') message.reply(response)
      else message.react('✅')
      break
    case 'info':
      const user = args[1]
        ? profiles[args[1].match(/(\d{15,})/)[1]] || profiles[userId]
        : profiles[userId]
      const embed = new Discord.MessageEmbed()
        .setColor('#84ed39')
        .setTitle('Банковский профиль')
        .setThumbnail(
          'https://cdn.discordapp.com/attachments/402109825896415232/692820764478668850/yummylogo.jpg'
        )
        .addField(
          'Кредит',
          `${
            user.credit
              ? `Сумма: ${+user.credit.sum.toFixed(3)}\nПроцент: ${+user.credit.percent.toFixed(3)}\nДедлайн: ${new Date(
                  user.credit.deadline
                )}`
              : 'У вас нет кредита'
          }`
        )
        .addField(
          'Депозит',
          `${
            user.deposit
              ? `Сумма: ${+user.deposit.sum.toFixed(3)}\nПроцент: ${+user.deposit.percent.toFixed(3)}\nДедлайн: ${new Date(
                  user.deposit.deadline
                )}`
              : 'У вас нет депозита'
          }`
        )
        .setTimestamp()
      if (user.bancrot) embed.addField('Банкрот', `Банкрот снимется ${new Date(user.bancrot)}`)
      message.reply(embed)
      break
    case 'remove':
      response = ModerationCommands.remove(message, args)
      if (typeof response === 'string') message.reply(response)
			else message.react('✅')
		break
    default:
      message.reply(`Command ${args[0]} not found`)
  }

  fs.writeFile(
    __dirname.replace(/cmds$/, '') + 'bank_profiles.json',
    JSON.stringify(profiles),
    err => (err ? console.error(err) : null)
  )
}

module.exports.help = {
  name: 'bank',
}
