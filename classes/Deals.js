const { User } = require('./User')
const sqlite3 = require('sqlite3').verbose()
const { log } = require('../utils/log')
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
  constructor(sum, days, percent, id) {
    super(sum, days, percent)
    this.init(sum, id)
  }
  async init(sum, id) {
    const user = await User.getOrCreateUser(id)
    user.coins -= +sum
    user.save()
  }
  async repay(sum, bankMember) {
    const user = await User.getOrCreateUser(bankMember.id)
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
    const user = await User.getOrCreateUser(bankMember.id)
    user.coins += Math.floor(+this.sum)
    bankMember.deposit = null
    user.save()
    bankMember.save()
  }
}

class Credit extends Deal {
  constructor(sum, days, percent, id) {
    super(sum, days, percent)
    this.init(sum, id)
  }
  async init(sum, id) {
    const user = await User.getOrCreateUser(id)
    user.coins += +sum
    user.save()
  }
  async repay(sum, bankMember) {
    const user = await User.getOrCreateUser(bankMember.id)
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
  async badUser(bankMember, guild, rec) {
    const user = await User.getOrCreateUser(bankMember.id)
    const member = guild.members.cache.get(bankMember.id)
    if (rec) makeBancrot()
    else {
      this.sum *= 1.5
      this.sum -= user.coins + (bankMember.deposit ? bankMember.deposit.sum : 0)
      if (user.coins > 0) user.coins = -5000
      if (this.sum > 0) makeBancrot()

      user.dailyLevel = 0
      user.level = Math.max(10, user.level - 10)
      bankMember.credit = null
      bankMember.deposit = null
      log('New Bancrot: ' + member)
    }
    bankMember.save()
    user.save()

    async function makeBancrot() {
      const db = new sqlite3.Database('./data.db')
      user.coins = 0
      bankMember.bancrot = Date.now() + 20 * 24 * 3600 * 1000
      if (!member) return
      const role = member.guild.roles.cache.find(r => r.name === 'Банкрот')
      member.roles.add(role)
      const roles = await new Promise(resolve =>
        db.run('SELECT * FROM roles', (err, roles) => resolve(roles))
      )
      for (const roleData of roles) {
        const role = member.guild.roles.cache.get(roleData.id)
        if (member.roles.cache.has(role.id)) member.roles.remove(role)
      }
      db.close()
    }
  }
}

exports.Credit = Credit
exports.Deposit = Deposit
