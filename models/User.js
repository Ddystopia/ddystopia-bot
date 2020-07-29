const mongoose = require('mongoose')
const { getConvertedEmojiArray } = require('../utils/getConvertedEmojiArray')

const userSchema = mongoose.Schema({
  id: String,
  guildId: String,
  coins: { type: Number, default: 0, set: n => Math.floor(n) },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  rep: { type: Number, default: 0 },
  birthday: { type: String, default: '' },
  marry: { type: String, default: '' },
  dailyLevel: { type: Number, default: 0 },
  about: { type: String, default: '' },
  loot: [{ loot: String, number: Number }],
  timers: {
    daily: Number,
    loot: Number,
  },
})
// not arrow func
userSchema.statics.getOrCreate = async function (id, guildId) {
  let user = await this.findOne({ id, guildId })
  if (!user) {
    user = new User({ id, guildId })
    user.save()
  }
  return user
}
userSchema.methods.getLootArray = function (string, guildLoot) {
  const lootIndexes = {}
  const lootArray = []
  getConvertedEmojiArray(string, guildLoot)
    .filter(item => this.loot.some(l => l.loot === item))
    .forEach(loot => (lootIndexes[loot] = lootIndexes[loot] ? lootIndexes[loot] + 1 : 1))

  for (const loot in lootIndexes) {
    const ownLoot = this.findOwnLoot(loot)
    if (lootIndexes[loot] > ownLoot.number) lootIndexes[loot] = ownLoot.number
    for (let i = 0; i < lootIndexes[loot]; i++) lootArray.push(loot)
  }
  return lootArray
}
userSchema.methods.addLoot = function (lootArray) {
  lootArray.forEach(loot => {
    const ownLoot = this.findOwnLoot(loot)
    if (!ownLoot) this.loot.push({ loot, number: 1 })
    else ownLoot.number++
  })
  this.markModified('loot')
}
userSchema.methods.removeLoot = function (lootArray) {
  lootArray.forEach(loot => {
    const ownLoot = this.findOwnLoot(loot) || { number: 1 }
    if (ownLoot.number < 2) this.loot = this.loot.filter(l => l.loot !== loot)
    else ownLoot.number--
  })
  this.markModified('loot')
}
userSchema.methods.findOwnLoot = function (loot) {
  return this.loot.find(el => el.loot === loot) || null
}

const User = mongoose.model('User', userSchema)
module.exports.User = User
