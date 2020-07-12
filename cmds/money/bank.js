const { MessageEmbed } = require('discord.js')
const { BankMember } = require('../../classes/BankMember')
const { Credit } = require('../../classes/Deals')
const sqlite3 = require('sqlite3').verbose()
const { log } = require('../../utils/log.js')

class ModerationCommands {
  static async getBankProfiles() {
    return new Promise(resolve => {
      const db = new sqlite3.Database('./data.db')
      db.all(`SELECT id FROM users`, (err, p) =>
        resolve(p.map(us => BankMember.getOrCreateBankMember(us.id)))
      )
      db.close()
    })
  }
  static async closeDeals(guild) {
    const profiles = await ModerationCommands.getBankProfiles()
    for (const userId in profiles) {
      const member = guild.members.cache.get(`${userId}`)
      if (!member) continue

      const bancrotRole = member.guild.roles.cache.find(r => r.name === 'Банкрот')
      const element = await profiles[userId]

      const [timeToCredit, timeToDeposit, timeToBancrot] = [
        element.credit && element.credit.deadline - Date.now(),
        element.deposit && element.deposit.deadline - Date.now(),
        element.bancrot && element.bancrot - Date.now(),
      ]

      if (timeToCredit <= 60 * 60 * 1000) {
        setTimeout(() => {
          element.credit.badUser(element, guild)
          element.save()
        }, Math.max(timeToCredit, 0))
      }

      if (timeToDeposit <= 60 * 60 * 1000) {
        setTimeout(() => {
          element.deposit.payDeposits(element)
          element.save()
        }, Math.max(timeToDeposit, 0))
      }

      if (timeToBancrot <= 60 * 60 * 1000) {
        setTimeout(() => {
          element.bancrot = null
          member.roles.remove(bancrotRole)
          element.save()
        }, Math.max(timeToBancrot, 0))
      } else if (element.bancrot && !member.roles.cache.has(bancrotRole.id)) {
        Credit.prototype.badUser(element, guild, true)
      }
    }
  }

  static async calcPercents() {
    const profiles = await ModerationCommands.getBankProfiles()
    for (const userId in profiles) {
      const element = await profiles[userId]
      if (element.credit)
        element.credit.sum += (element.credit.sum * element.credit.percent) / 100
      if (element.deposit)
        element.deposit.sum += (element.deposit.sum * element.deposit.percent) / 100
      if (element.credit || element.deposit) element.save()
    }
  }

  static async remove(message, args) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return
    const user = message.mentions.users.first()
    if (!user) return "I don't know who is it"
    const bankMember = await BankMember.getOrCreateBankMember(user.id)
    switch (args[1]) {
      case 'credit':
        bankMember.credit = null
        log(`${message.author.tag} remove credit ${user.username}`)
        break
      case 'deposit':
        bankMember.deposit = null
        log(`${message.author.tag} remove deposit ${user.username}`)
        break
      case 'bancrot': {
        bankMember.bancrot = null
        const role = message.guild.roles.cache.find(r => r.name === 'Банкрот')
        message.guild.members.cache.get(user.id).roles.remove(role)
        log(`${message.author.tag} remove bancrot ${user.username}`)
        break
      }
      default:
        return "I don't know this property"
    }
    bankMember.save()
    return true
  }
}

module.exports.run = async (message, args) => {
  if (args === 'calcPercents') return ModerationCommands.calcPercents() //inclusion
  if (args === 'closeDeals') return ModerationCommands.closeDeals(message.guild) //inclusion
  if (message.channel.id !== '694199268847648813') return
  const userId = message.author.id
  const bankMember = await BankMember.getOrCreateBankMember(userId)

  let response
  switch (args[0]) {
    case 'create':
      if (args[1] === 'credit') response = await bankMember.createCredit(args[2], args[3])
      else if (args[1] === 'deposit')
        response = await bankMember.createDeposit(args[2], args[3])

      if (typeof response === 'string') message.reply(response)
      else if (response) message.react('✅')
      else message.react('❌')
      break

    case 'repay':
      if (args[1] === 'credit') {
        if (!bankMember.credit) return message.reply("You don't have a credit")
        response = await bankMember.credit.repay(args[2], bankMember)
      } else if (args[1] === 'deposit') {
        if (!bankMember.deposit) return message.reply("You don't have a deposit")
        response = await bankMember.deposit.repay(args[2], bankMember)
      }

      if (typeof response === 'string') message.reply(response)
      else if (response) message.react('✅')
      else message.react('❌')
      break

    case 'remove':
      response = await ModerationCommands.remove(message, args)
      if (typeof response === 'string') message.reply(response)
      else if (response) message.react('✅')
      else message.react('❌')
      break

    case 'info': {
      const user = message.mentions.users.first()
        ? await BankMember.getOrCreateBankMember(message.mentions.users.first().id)
        : bankMember
      const embed = new MessageEmbed()
        .setColor('#84ed39')
        .setTitle('Банковский профиль')
        .setThumbnail(
          'https://cdn.discordapp.com/attachments/402109825896415232/692820764478668850/yummylogo.jpg'
        )
        .addField(
          'Кредит',
          `${
            user.credit
              ? `Сумма: ${user.credit.sum}
Процент: ${+user.credit.percent.toFixed(3)}
Дедлайн: ${new Date(user.credit.deadline)}`
              : 'У вас нет кредита'
          }`
        )
        .addField(
          'Депозит',
          `${
            user.deposit
              ? `Сумма: ${user.deposit.sum}
Процент: ${+user.deposit.percent.toFixed(3)}
Дедлайн: ${new Date(user.deposit.deadline)}`
              : 'У вас нет депозита'
          }`
        )
        .setTimestamp()
      if (user.bancrot)
        embed.addField('Банкрот', `Банкрот снимется ${new Date(user.bancrot)}`)
      message.reply(embed)
      break
    }
  }
}

module.exports.help = {
  name: 'bank',
}
