const mongoose = require('mongoose')
const { onlyEmoji } = require('emoji-aware')

const userSchema = mongoose.Schema({
  id: String,
  guildId: String,
  coins: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  rep: { type: Number, default: 0 },
  birthday: { type: String, default: '' },
  marry: { type: String, default: '' },
  dailyLevel: { type: Number, default: 0 },
  about: { type: String, default: '' },
  loot: { type: Object, default: {} },
  timers: {
    daily: Number,
    loot: Number,
  },
})
// not arrow func
userSchema.statics.getOrCreate = async function (id, guildId) {
  let user = await this.findOne({ id, guildId })
  if (!user) user = new User({ id, guildId })
  user.coins = Math.floor(user.coins)
  return user
}
userSchema.methods.getLootArray = function (args, loot) {
  const lootIndexes = {}
  const lootArray = []
  onlyEmoji(args.join(''))
    .filter(item => !!loot[item])
    .filter(item => !!this.loot[item])
    .forEach(loot => (lootIndexes[loot] = lootIndexes[loot] ? lootIndexes[loot] + 1 : 1))
  for (const loot in lootIndexes) {
    if (lootIndexes[loot] > this.loot[loot]) lootIndexes[loot] = this.loot[loot]
    for (let i = 0; i < lootIndexes[loot]; i++) lootArray.push(loot)
  }
  return lootArray
}
userSchema.methods.addLoot = function (lootArray) {
  lootArray.forEach(loot => {
    if (this.loot[loot]) this.loot[loot]++
    else this.loot[loot] = 1
  })
}
userSchema.methods.removeLoot = function (lootArray) {
  lootArray.forEach(loot => {
    if (this.loot[loot] < 2) delete this.loot[loot]
    else this.loot[loot]--
  })
}

const User = mongoose.model('User', userSchema)
module.exports.User = User
