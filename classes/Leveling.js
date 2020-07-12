const { Collection } = require('discord.js')
const { User } = require('./User.js')
const { randomInteger } = require('../utils/randomInteger')
const { levelingRoles } = require('../config.json')
class Leveling {
  static calcXp(level) {
    return 5 * level ** 2 + 50 * level + 100
  }

  static _roleLeveling(member) {
    let roleIndex =
      Object.keys(levelingRoles).findIndex(level => level > member.level) - 1
    if (roleIndex === -2) roleIndex = Object.keys(levelingRoles).length - 1
    if (roleIndex < 0) return

    Object.values(levelingRoles)
      .filter(id => member.roles.cache.has(id))
      .filter(id => id !== Object.keys(levelingRoles)[roleIndex])
      .forEach(id => member.roles.remove(id))

    member.roles.add(Object.values(levelingRoles)[roleIndex], 'New level')
  }

  static async _doLeveling(newExp, member) {
    const user = await User.getOrCreateUser(member.id)
    if (!user.xp) user.xp = 0
    user.xp += randomInteger(newExp, newExp + 7 * Leveling._XP_TIME)
    let xp = Leveling.calcXp(user.level) // xp for up
    while (user.xp >= xp) {
      user.xp -= xp
      user.level++
      xp = Leveling.calcXp(user.level) // xp for up
    }
    // this._roleLeveling(member)
    user.save()
  }

  static textLeveling(member) {
    if (!Leveling._users.has(member.id)) Leveling._users.set(member.id, Date.now())
    let userTime = (Date.now() - Leveling._users.get(member.id)) / 1000 / 60 // To minutes
    if (userTime < Leveling._XP_TIME) return

    const newExp = Math.floor(Leveling._XP_TIME * Leveling._XP_MUL)
    Leveling._doLeveling(newExp, member)
    Leveling._users.set(member.id, Date.now())
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
            const newExp = 2 * (members.size - 1)
            Leveling._doLeveling(newExp, member)
          })
        })
    }, 60 * 1000)
  }
}
Leveling._XP_TIME = 2
Leveling._XP_MUL = 9
Leveling._users = new Collection()

module.exports.Leveling = Leveling
