const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./data.db')
const { onlyEmoji } = require('emoji-aware')

class User {
  constructor({
    id,
    _coins = 0,
    xp = 0,
    level = 0,
    rep = 0,
    loot = {},
    birthday = null,
    marry = null,
    dailyLevel = 0,
    about = '',
    dailyTimer = 0,
    lootTimer = 0,
  }) {
    this.id = id
    this._coins = _coins
    this.xp = xp
    this.level = level
    this.rep = rep
    this.loot = loot
    this.birthday = birthday
    this.marry = marry
    this.dailyLevel = dailyLevel
    this.about = about
    this.timers = {
      daily: dailyTimer,
      loot: lootTimer,
    }
  }
  get coins() {
    return Math.floor(this._coins)
  }
  set coins(value) {
    this._coins = Math.floor(value)
  }
  static async getOrCreateUser(id) {
    return await new Promise(resolve =>
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (!row) {
          db.run('INSERT INTO users(id) VALUES(?)', [id])
          return resolve(new User({ id }))
        }
        resolve(new User({ ...row, loot: JSON.parse(row.loot || '{}') }))
      })
    )
  }
  getLootArray(args, loot) {
    const lootIndexes = {}
    const lootArray = []
    onlyEmoji(args.join(''))
      .filter(item => !!loot[item])
      .forEach(
        loot => (lootIndexes[loot] = lootIndexes[loot] ? lootIndexes[loot] + 1 : 1)
      )
    for (const loot in lootIndexes) {
      if (lootIndexes[loot] > this.loot[loot]) lootIndexes[loot] = this.loot[loot]
      for (let i = 0; i < lootIndexes[loot]; i++) lootArray.push(loot)
    }
    return lootArray
  }
  save() {
    db.serialize(() => {
      db.run(
        `UPDATE users SET 
      id=${this.id},
      _coins=${this._coins},
      xp=${this.xp},
      level=${this.level},
      rep=${this.rep},
      loot='${JSON.stringify(this.loot)}',
      birthday=${this.birthday},
      marry=${this.marry},
      dailyLevel=${this.dailyLevel},
      dailyTimer=${this.timers.daily},
      lootTimer=${this.timers.loot},
      about='${this.about || ''}'
			WHERE id=${this.id}`,
        err => err && console.error(err)
      )
    })
  }
  addLoot(lootArray) {
    lootArray.forEach(loot => {
      if (this.loot[loot]) this.loot[loot]++
      else this.loot[loot] = 1
    })
  }
  removeLoot(lootArray) {
    lootArray.forEach(loot => {
      if (this.loot[loot] < 2) delete this.loot[loot]
      else this.loot[loot]--
    })
  }
}
module.exports = User
