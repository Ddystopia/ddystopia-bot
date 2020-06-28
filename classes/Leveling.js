const { Collection } = require('discord.js')
const User = require('./User.js')
const randomInteger = require('../utils/randomInteger')
class Leveling {
  static calcXp(level) {
    return 5 * level ** 2 + 50 * level + 100
  }

  static async _calcLeveling(newExp, id) {
    const user = await User.getOrCreateUser(id)
    if (!user.xp) user.xp = 0
    user.xp += randomInteger(newExp, newExp + 7 * Leveling._XP_TIME)
    let xp = Leveling.calcXp(user.level) // xp for up
    while (user.xp >= xp) {
      user.xp -= xp
      user.level++
      xp = Leveling.calcXp(user.level) // xp for up
    }
    user.save()
  }

  static textLeveling(id) {
    if (!Leveling._users.has(id)) Leveling._users.set(id, Date.now())
    let userTime = (Date.now() - Leveling._users.get(id)) / 1000 / 60 // To minutes
    if (userTime < Leveling._XP_TIME) return

    const newExp = Math.floor(Leveling._XP_TIME * Leveling._XP_MUL)
    Leveling._calcLeveling(newExp, id)
    Leveling._users.set(id, Date.now())
  }

  static voiceLeveling(channels) {
    setInterval(() => {
      channels.cache
        .filter(channel => channel.type === 'voice')
        .each(channel => {
          const members = channel.members.filter(
            member => !member.voice.mute && !member.voice.deaf
          )
          members.each(member => {
            const newExp = 6 * (members.size - 1)
            Leveling._calcLeveling(newExp, member.id)
          })
        })
    }, 60 * 1000)
  }
}
Leveling._XP_TIME = 2
Leveling._XP_MUL = 15
Leveling._users = new Collection()

module.exports = Leveling
