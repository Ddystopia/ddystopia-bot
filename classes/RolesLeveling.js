const { RoleForLeveling } = require('../models/RoleForLeveling')

class RolesLeveling {
  static async roleControls(member, user) {
    const [ids, levels] = await this.getLevelingRoles(member.guild.id)
    const roleIndex = levels.findIndex(level => level <= user.level)
    ids
      .filter(id => id !== ids[roleIndex])
      .filter(id => member.roles.cache.has(id))
      .forEach(id => member.roles.remove(id))

    if (roleIndex >= 0) member.roles.add(ids[roleIndex], 'New level')
  }
  static async getLevelingRoles(guildId) {
    const rows = await RoleForLeveling.find({ guildId }).sort({ level: 'desc' })
    const ids = []
    const levels = []
    rows.forEach(row => {
      ids.push(row.id)
      levels.push(row.level)
    })
    return [ids, levels]
  }
}
module.exports.RolesLeveling = RolesLeveling
