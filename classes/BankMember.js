const { User } = require('./User')
const sqlite3 = require('sqlite3').verbose()
const { Credit, Deposit, latestCredits } = require('./Deals')
class BankMember {
  constructor({ id, credit = null, deposit = null, bancrot = null }) {
    this.id = id
    this.credit = credit
    this.deposit = deposit
    this.bancrot = bancrot
  }
  static async getOrCreateBankMember(id) {
    const db = new sqlite3.Database('./data.db')
    const response = new Promise(resolve =>
      db.get(
        `SELECT 
      users.id AS id,
      credits.sum AS crSum,
      credits.deadline AS crDeadline,
      credits.percent AS crPercent,
      deposits.sum AS depSum,
      deposits.deadline AS depDeadline, 
      deposits.percent AS depPercent,
      bancrots.deadline AS bancrot
      FROM users 
      lEFT JOIN credits ON users.id = credits.id
      lEFT JOIN deposits ON users.id = deposits.id
      lEFT JOIN bancrots ON users.id = bancrots.id
      WHERE users.id = ?`,
        [id],
        (err, us = { id }) => {
          const bankMember = new BankMember({
            id: us.id,
            credit: +us.crSum
              ? {
                  _sum: +us.crSum,
                  percent: +us.crPercent,
                  deadline: +us.crDeadline,
                }
              : null,
            deposit: +us.depSum
              ? {
                  _sum: +us.depSum,
                  percent: +us.depPercent,
                  deadline: +us.depDeadline,
                }
              : null,
            bancrot: +us.bancrot || null,
          })
          Object.setPrototypeOf(bankMember.credit || {}, Credit.prototype)
          Object.setPrototypeOf(bankMember.deposit || {}, Deposit.prototype)
          db.close()
          resolve(bankMember)
        }
      )
    )
    return response
  }
  save() {
    const { credit, deposit, bancrot } = this
    //do not convert to es2020 (?.)
    const db = new sqlite3.Database('./data.db')
    db.parallelize(() => {
      db.run(
        `INSERT INTO credits (id, sum, percent, deadline) VALUES
			(
				${this.id}, 
				${credit && credit.sum},
				${credit && credit.percent},
				${credit && credit.deadline}
				)
ON CONFLICT(id) DO UPDATE SET
		sum=${credit && credit.sum},
		percent=${credit && credit.percent},
		deadline='${credit && credit.deadline}'
		`,
        err => err && console.error(err)
      )
      db.run(
        `INSERT INTO deposits (id, sum, percent, deadline) VALUES
			(
				${this.id}, 
				${deposit && deposit.sum},
				${deposit && deposit.percent},
				${deposit && deposit.deadline}
				 )
ON CONFLICT(id) DO UPDATE SET
		sum=${deposit && deposit.sum},
		percent=${deposit && deposit.percent},
		deadline='${deposit && deposit.deadline}'
		`,
        err => err && console.error(err)
      )
      db.run(
        `INSERT INTO bancrots (id, deadline) VALUES
			(${this.id}, ${bancrot})
ON CONFLICT(id) DO UPDATE SET
		deadline='${bancrot}'
		`,
        err => err && console.error(err)
      )
    })
    db.close()
  }
  async createCredit(sum, days) {
    if (this.credit) return 'You already have credit.'
    if (isNaN(+sum) || isNaN(+days)) return 'Invalid arguments'
    if (+sum > 1e5) return 'Invalid argument sum(so many)'
    if (+days > 4) return 'Invalid argument days(so many)'
    if (+sum < 5e4 && +days > 2) return 'So many days on this sum'

    const user = await User.getOrCreateUser(this.id)
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
    this.credit = new Credit(sum, days, percent, this.id)
    this.save()
    return true
  }
  async createDeposit(sum, days) {
    if (this.deposit) return 'You already have deposit.'
    if (this.credit) return "You have some credit, I can't make deposit."
    if (isNaN(+sum) || isNaN(+days)) return 'Invalid arguments'
    if (+sum < 500) return 'Too small sum'
    if (+days < 5) return 'Too few days'
    if (+days > 100) return 'Too many days'
    const user = await User.getOrCreateUser(this.id)
    if (user.coins < sum) return "You don't have this sum"

    const percent =
      Math.min((Math.E ** 6) ** (days / 10) / 3, (days / 10 - 1) * 6.5 + 15, 20) / 2.75
    this.deposit = new Deposit(sum, days, percent, this.id)
    this.save()
    return true
  }
}
exports.BankMember = BankMember
