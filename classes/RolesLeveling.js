const sqlite3 = require('sqlite3').verbose()

class RolesLeveling {
  static async roleControls(member, user) {
    const levelingRoles = await this.getLevelingRoles()
    const levels = Object.values(levelingRoles)
    const ids = Object.keys(levelingRoles)
    const roleIndex = levels.findIndex(level => +level <= +user.level)

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
        db.all('SELECT * FROM levelingRoles', (err, rows) =>
          resolve(Object.fromEntries(rows.map(({ id, level }) => [id, level])))
        )
      )
    })
    db.close()
    return response
  }
}
module.exports.RolesLeveling = RolesLeveling
