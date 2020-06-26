const { readFileSync, writeFileSync } = require('fs')
const { onlyEmoji } = require('emoji-aware')
const path = require('path')
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
    timers,
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
      daily: (timers && timers.daily) || 0,
      loot: (timers && timers.loot) || 0,
    }
  }
  get coins() {
    return Math.floor(this._coins)
  }
  set coins(value) {
    this._coins = Math.floor(value)
  }
  static getOrCreateUser(id) {
    let response
    try {
      const file = JSON.parse(
        readFileSync(path.join(__dirname, '..', `profiles/${id}.json`), 'utf-8')
      )
      response = new User({ ...file, id })
    } catch (err) {
      response = new User({ id })
    }
    return response
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
    writeFileSync(
      path.join(__dirname, '..', `profiles/${this.id}.json`),
      this.toJSONString()
    )
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
  toJSONString() {
    return JSON.stringify({ ...this }).replace(
      /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3})Z/,
      '$1'
    )
  }
}
module.exports = User
