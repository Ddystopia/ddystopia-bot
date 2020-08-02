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
  if (+sum > 2e5) return 'Invalid argument sum(so many)'
  if (sum < 1000) 'Слишком маленькая сумма'
  if (+days > 6) return 'Invalid argument days(so many)'
  if (+sum < 5e4 && +days > 2) return 'Слишком много дней для такой суммы'

  const user = await User.getOrCreate(this.id, this.guildId)
  if (sum / user.coins > 15 && user.coins > 200)
    return `Для этой суммы, вы должны иметь больше, чем ${+(sum / 15).toFixed(3)} ${
      global.currency
    }`

  latestCredits.set(this.id, Date.now() + 3 * 3600 * 1000)

  user.coins += +sum
  this.credit = new Credit({ sum, days })

  this.markModified('credit')
  this.save()
  user.save()
  return true
}
bankMemberSchema.methods.createDeposit = async function createDeposit(sum, days) {
  if (this.deposit) return 'You already have deposit.'
  if (this.credit) return "You have some credit, I can't make deposit."
  if (isNaN(+sum) || isNaN(+days)) return 'Invalid arguments'
  if (+sum < 500) return 'Too small sum'
  if (+days < 5) return 'Слишком мало дней'
  if (+days > 100) return 'Слишком много дней'
  const user = await User.getOrCreate(this.id, this.guildId)
  if (user.coins < sum) return "You don't have this sum"

  user.coins -= +sum
  this.deposit = new Deposit({ sum, days })

  this.markModified('deposit')
  this.save()
  user.save()
  return true
}

const BankMember = mongoose.model('BankMember', bankMemberSchema)
exports.BankMember = BankMember
