const { MessageEmbed } = require('discord.js')
const { Guild } = require('../../models/Guild')
const { BankMember } = require('../../models/BankMember')
const { Credit, Deposit } = require('../../classes/Deals')

class ModerationCommands {
  static async closeDeals(client, guild, bankruptRoleId) {
    const bankMembers = await BankMember.find({ guildId: guild.id })
    for (const bankMember of bankMembers) {
      const member = guild.member(bankMember.id)
      if (!member) continue
      Object.setPrototypeOf(bankMember.credit || {}, Credit.prototype)
      Object.setPrototypeOf(bankMember.deposit || {}, Deposit.prototype)
      const bankruptRole = guild.roles.cache.get(bankruptRoleId)

      const [timeToCredit, timeToDeposit, timeToBankrupt] = [
        bankMember.credit && bankMember.credit.deadline - Date.now(),
        bankMember.deposit && bankMember.deposit.deadline - Date.now(),
        bankMember.bankrupt && bankMember.bankrupt - Date.now(),
      ]

      if (timeToCredit && timeToCredit <= 60 * 60 * 1000) {
        client.timeouts.get(guild.id).push(
          setTimeout(() => {
            bankMember.credit.badUser(bankMember, guild, bankruptRole, false)
          }, Math.max(timeToCredit, 0))
        )
      }

      if (timeToDeposit && timeToDeposit <= 60 * 60 * 1000) {
        client.timeouts.get(guild.id).push(
          setTimeout(() => {
            bankMember.deposit.payDeposits(bankMember)
          }, Math.max(timeToDeposit, 0))
        )
      }

      if (timeToBankrupt && timeToBankrupt <= 60 * 60 * 1000) {
        client.timeouts.get(guild.id).push(
          setTimeout(() => {
            bankMember.bankrupt = null
            Guild.findOne({ id: guild.id }).then(guildDB => {
              guildDB.blacklist = guildDB.blacklist.filter(id => id !== bankMember.id)
              guildDB.markModified('blacklist')
              guildDB.save()
            })
            member.roles.remove(bankruptRole)
            bankMember.save()
          }, Math.max(timeToBankrupt, 0))
        )
      } else if (bankMember.bankrupt && !member.roles.cache.has(bankruptRole.id)) {
        Credit.prototype.badUser(bankMember, guild, bankruptRole, true)
      }
    }
  }

  static async calcPercents(guildId) {
    const bankMembers = await BankMember.find({ guildId })
    for (const bankMember of bankMembers) {
      if (bankMember.credit) {
        bankMember.credit.sum += (bankMember.credit.sum * bankMember.credit.percent) / 100
        bankMember.markModified('credit')
        bankMember.save()
      }
      if (bankMember.deposit) {
        bankMember.deposit.sum +=
          (bankMember.deposit.sum * bankMember.deposit.percent) / 100
        bankMember.markModified('deposit')
        bankMember.save()
      }
    }
  }

  static async remove(message, args, bankruptRole) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return
    const user = message.mentions.users.first()
    if (!user) return "I don't know who is it"
    const bankMember = await BankMember.getOrCreate(user.id, message.guild.id)
    switch (args[1]) {
      case 'credit':
        bankMember.credit = null
        bankMember.markModified('credit')
        break
      case 'deposit':
        bankMember.deposit = null
        bankMember.markModified('deposit')
        break
      case 'bankrupt': {
        bankMember.bankrupt = null
        Guild.findOne({ id: message.guild.id }).then(guildDB => {
          guildDB.blacklist = guildDB.blacklist.filter(id => id !== bankMember.id)
          guildDB.markModified('blacklist')
          guildDB.save()
        })
        const role = message.guild.roles.cache.get(bankruptRole)
        message.guild.member(user).roles.remove(role)
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
  const { bankruptRole } = await Guild.getOrCreate(message.guild.id)
  if (!bankruptRole)
    return message.reply(
      'Попросите Администратора добавить банкротскую роль, без неё банк не работает'
    )

  if (args === 'calcPercents') return ModerationCommands.calcPercents(message.guild.id) //inclusion
  if (args === 'closeDeals')
    return ModerationCommands.closeDeals(message.client, message.guild, bankruptRole) //inclusion
  const bankMember = await BankMember.getOrCreate(message.author.id, message.guild.id)

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
    case 'delete':
      response = await ModerationCommands.remove(message, args, bankruptRole)
      if (typeof response === 'string') message.reply(response)
      else if (response) message.react('✅')
      else message.react('❌')
      break

    case 'инфо':
    case 'i':
    case 'info': {
      const user = message.mentions.users.first()
        ? await BankMember.getOrCreate(
            message.mentions.users.first().id,
            message.guild.id
          )
        : bankMember
      const embed = new MessageEmbed()
        .setColor('#84ed39')
        .setTitle('Банковский профиль')
        .setThumbnail(message.author.avatarURL())
        .addField(
          'Кредит',
          `${
            user.credit
              ? `Сумма: ${user.credit.sum}
Процент: ${+user.credit.percent}
Дедлайн: ${new Date(user.credit.deadline)}`
              : 'У вас нет кредита'
          }`
        )
        .addField(
          'Депозит',
          `${
            user.deposit
              ? `Сумма: ${user.deposit.sum}
Процент: ${+user.deposit.percent}
Дедлайн: ${new Date(user.deposit.deadline)}`
              : 'У вас нет депозита'
          }`
        )
        .setTimestamp()
      if (user.bankrupt)
        embed.addField('Банкрот', `Банкрот снимется ${new Date(user.bankrupt)}`)
      message.reply(embed)
      break
    }
  }
}

module.exports.help = {
  name: 'bank',
  aliases: ['банк'],
}
