const { User } = require('../models/User')
const { RoleForShop } = require('../models/RoleForShop.js')
const { Guild } = require('discord.js')
const latestCredits = new Map()
module.exports.latestCredits = latestCredits

class Deal {
  constructor(sum, days, percent) {
    this._sum = (+sum * percent) / 100 + +sum
    this.deadline = Date.now() + days * 24 * 3600 * 1000
    this.percent = percent
  }
  get sum() {
    return Math.floor(this._sum)
  }
  set sum(value) {
    this._sum = Math.floor(value)
  }
}

class Deposit extends Deal {
  constructor({ sum, days, percent, user }) {
    super(sum, days, percent)
    user.coins -= +sum
    user.save()
  }
  async repay(sum, bankMember) {
    const user = await User.getOrCreate(bankMember.id, bankMember.guildId)
    if (bankMember.credit) return 'You already have a credit.'
    if (isNaN(+sum)) return

    if (sum > user.coins) return false
    else user.coins -= +sum

    this.sum += +sum

    user.save()
    bankMember.save()
    return true
  }
  async payDeposits(bankMember) {
    const user = await User.getOrCreate(bankMember.id, bankMember.guildId)
    user.coins += Math.floor(+this.sum)
    bankMember.deposit = null
    user.save()
    bankMember.save()
  }
}

class Credit extends Deal {
  constructor({ sum, days, percent, user }) {
    super(sum, days, percent)
    user.coins += +sum
    user.save()
  }
  async repay(sum, bankMember) {
    const user = await User.getOrCreate(bankMember.id, bankMember.guildId)
    if (isNaN(+sum)) return
    if (latestCredits.has(bankMember.id)) {
      if (latestCredits.get(bankMember.id) < Date.now())
        latestCredits.delete(bankMember.id)
      else return 'Подождите немного'
    }
    if (sum > user.coins) return false
    else user.coins -= +sum

    this.sum -= +sum
    if (this.sum <= 0) bankMember.credit = null
    user.save()
    bankMember.save()
    return true
  }
  async badUser(bankMember, guild, bancrotRole, rec) {
    const user = await User.getOrCreate(bankMember.id, bankMember.guildId)
    const member = guild.member(bankMember.id)
    if (rec) makeBancrot(member, user)
    else {
      this.sum *= 1.5
      this.sum -= user.coins + (bankMember.deposit ? bankMember.deposit.sum : 0)
      if (user.coins > 0) user.coins = -5000
      if (this.sum > 0) makeBancrot(member, user)

      user.dailyLevel = 0
      user.level = Math.max(0, user.level - 10)
      bankMember.credit = null
      bankMember.deposit = null
    }

    bankMember.save()
    user.save()

    async function makeBancrot(member, user) {
      user.coins = 0
      bankMember.bancrot = Date.now() + 20 * 24 * 3600 * 1000
      if (!member) return
      member.roles.add(bancrotRole)
      const roles = await RoleForShop.find({ guildId: guild.id })
      for (const roleData of roles) {
        const role = member.guild.roles.cache.get(roleData.id)
        if (member.roles.cache.has(role.id)) member.roles.remove(role)
      }
      Guild.findOne({ id: guild.id }).then(guildDB => {
        guildDB.blacklist.push(member.id)
        guildDB.markModified('blacklist')
        guildDB.save()
      })
    }
  }
}

exports.Credit = Credit
exports.Deposit = Deposit
