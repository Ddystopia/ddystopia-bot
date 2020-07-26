const { Collection } = require('discord.js')
const { User } = require('../models/User.js')
const { RolesLeveling } = require('./RolesLeveling')
const { randomInteger } = require('../utils/randomInteger')
class Leveling {
  static calcXp(level) {
    return 5 * level ** 2 + 50 * level + 100
  }

  static async _doLeveling(newExp, member) {
    const user = await User.getOrCreate(member.id)
    if (!user.xp) user.xp = 0
    user.xp += randomInteger(newExp - 7, newExp + 7)
    let xp = this.calcXp(user.level) // xp for up
    while (user.xp >= xp) {
      user.xp -= xp
      user.level++
      xp = this.calcXp(user.level) // xp for up
    }
    RolesLeveling.roleControls(member, user)
    user.save()
  }

  static textLeveling(member) {
    if (!this._users.has(member.id)) this._users.set(member.id, Date.now())
    let userTime = (Date.now() - this._users.get(member.id)) / 1000 / 60 // To minutes
    if (userTime < this._XP_TIME) return

    const newExp = Math.floor(this._XP_TIME * this._XP_MUL)
    this._doLeveling(newExp, member)
    this._users.set(member.id, Date.now())
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
            const newExp = members.size - 1
            this._doLeveling(newExp, member)
          })
        })
    }, 60 * 1000)
  }
}
Leveling._XP_TIME = 2
Leveling._XP_MUL = 9
Leveling._users = new Collection()

module.exports.Leveling = Leveling
