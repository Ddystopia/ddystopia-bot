const { User } = require('./User')
const mongoose = require('mongoose')
const { Credit, Deposit, latestCredits } = require('../classes/Deals')

const bankMemberSchema = mongoose.Schema({
  id: String,
  guildId: String,
  credit: {
    type: {
      sum: { type: Number, get: v => Math.floor(v) },
      percent: { type: Number, get: v => +v.toFixed(2) },
      deadline: Number,
    },
    default: null,
  },
  deposit: {
    type: {
      sum: { type: Number, get: v => Math.floor(v) },
      percent: { type: Number, get: v => +v.toFixed(2) },
      deadline: Number,
    },
    default: null,
  },
  bankrupt: Number,
})

// not arrow func
bankMemberSchema.statics.getOrCreate = async function (id, guildId) {
  let bankMember = await this.findOne({ id, guildId })
  if (!bankMember) {
    bankMember = new BankMember({ id, guildId })
    bankMember.save()
  }
  Object.setPrototypeOf(bankMember.credit || {}, Credit.prototype)
  Object.setPrototypeOf(bankMember.deposit || {}, Deposit.prototype)
  return bankMember
}
bankMemberSchema.methods.createCredit = async function createCredit(sum, days) {
  if (this.credit) return 'You already have credit.'
  if (isNaN(+sum) || isNaN(+days)) return 'Invalid arguments'
  if (+sum > 1e5) return 'Invalid argument sum(so many)'
  if (+days > 4) return 'Invalid argument days(so many)'
  if (+sum < 5e4 && +days > 2) return 'So many days on this sum'

  const user = await User.getOrCreate(this.id, this.guildId)
  if (sum < 1000) 'Invalid argument sum(so few)'
  if (sum / user.coins > 15 && user.coins > 200)
    return `Для этой суммы, вы должны иметь больше, чем ${+(sum / 15).toFixed(3)} ${
      global.currency
    }`

  latestCredits.set(this.id, Date.now() + 3 * 3600 * 1000)
  const percent = Math.max(
    -((Math.E * 6) ** (sum / 1e4) - 55),
    -(sum / 1e4 - 1) * 5 + 25,
    15
  )
  this.credit = new Credit({ sum, days, percent, user })
  this.markModified('credit')
  this.save()
  return true
}
bankMemberSchema.methods.createDeposit = async function createDeposit(sum, days) {
  if (this.deposit) return 'You already have deposit.'
  if (this.credit) return "You have some credit, I can't make deposit."
  if (isNaN(+sum) || isNaN(+days)) return 'Invalid arguments'
  if (+sum < 500) return 'Too small sum'
  if (+days < 5) return 'Too few days'
  if (+days > 100) return 'Too many days'
  const user = await User.getOrCreate(this.id, this.guildId)
  if (user.coins < sum) return "You don't have this sum"

  const percent =
    Math.min((Math.E ** 6) ** (days / 10) / 3, (days / 10 - 1) * 6.5 + 15, 20) / 2.75
  this.deposit = new Deposit({ sum, days, percent, user })
  this.markModified('deposit')
  this.save()
  return true
}

const BankMember = mongoose.model('BankMember', bankMemberSchema)
exports.BankMember = BankMember
