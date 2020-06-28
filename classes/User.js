const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./data.db')
const { onlyEmoji } = require('emoji-aware')

class User {
  constructor({
    id,
    _coins,
    xp,
    level,
    rep,
    loot,
    birthday,
    marry,
    dailyLevel,
    about,
    dailyTimer,
    lootTimer,
  }) {
    this.id = id
    this._coins = _coins || 0
    this.xp = xp || 0
    this.level = level || 0
    this.rep = rep || 0
    this.loot = loot || {}
    this.birthday = birthday || null
    this.marry = marry || null
    this.dailyLevel = dailyLevel || 0
    this.about = about || ''
    this.timers = {
      daily: dailyTimer || 0,
      loot: lootTimer || 0,
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
        if (!row) db.run('INSERT INTO users(id) values(?)', [id])
        resolve(new User(row || { id }))
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
        `
      UPDATE users SET 
      id=?,
      _coins=?,
      xp=?,
      level=?,
      rep=?,
      loot=?,
      birthday=?,
      marry=?,
      dailyLevel=?,
      dailyTimer=?,
      lootTimer=?,
      about=?
     WHERE id=?`,
        [
          this.id,
          this._coins,
          this.xp,
          this.level,
          this.rep,
          this.loot,
          this.birthday,
          this.marry,
          this.dailyLevel,
          this.dailyTimer,
          this.lootTimer,
					this.about,
					this.id
        ]
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
  _toJSONString() {
    return JSON.stringify({ ...this }).replace(
      /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3})Z/,
      '$1'
    )
  }
}
module.exports = User
