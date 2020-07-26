const { RoleForLeveling } = require('../models/RoleForLeveling')

class RolesLeveling {
  static async roleControls(member, user) {
    const [ids, levels] = await this.getLevelingRoles(member.guild.id)
    const roleIndex = levels.findIndex(level => level <= user.level)
    ids
      .filter(id => member.roles.cache.has(id))
      .filter(id => id !== ids[roleIndex])
      .forEach(id => member.roles.remove(id))

    if (roleIndex >= 0) member.roles.add(ids[roleIndex], 'New level')
  }
  static async getLevelingRoles(guildId) {
    const rows = await RoleForLeveling.find({ guildId })
    const ids = []
    const levels = []
    rows.forEach(row => {
      ids.push(row.id)
      levels.push(row.level)
    })
  }
}
module.exports.RolesLeveling = RolesLeveling
