const sqlite3 = require('sqlite3').verbose()

class RolesLeveling {
  static async roleControls(member, user) {
    const [ids, levels] = await this.getLevelingRoles()
    const roleIndex = levels.findIndex(level => level <= user.level)
    ids
      .filter(id => member.roles.cache.has(id))
      .filter(id => id !== ids[roleIndex])
      .forEach(id => member.roles.remove(id))

    if (roleIndex >= 0) member.roles.add(ids[roleIndex], 'New level')
  }
  static async getLevelingRoles() {
    const db = new sqlite3.Database('./data.db')
    let response = null
    db.serialize(() => {
      db.run(
        'CREATE TABLE IF NOT EXISTS levelingRoles(id VARCHAR, level INT)',
        err => err && console.error(err)
      )
      response = new Promise(resolve =>
        db.all('SELECT * FROM levelingRoles ORDER BY level DESC', (err, rows) => {
          const ids = []
          const levels = []
          rows.forEach(row => {
            ids.push(row.id)
            levels.push(row.level)
          })
          resolve([ids, levels])
        })
      )
    })
    db.close()
    return response
  }
}
module.exports.RolesLeveling = RolesLeveling
