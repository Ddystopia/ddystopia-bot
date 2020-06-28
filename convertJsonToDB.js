const sqlite3 = require('sqlite3').verbose()
const { readdirSync } = require('fs')
const path = require('path')
const readWrite = require('./utils/readWriteFile.js')
const db = new sqlite3.Database('./data.db')

db.serialize(() => {
  const profiles = []
  readdirSync(path.join(__dirname, 'profiles'))
    .filter(f => f.split('.').pop() === 'json')
    .forEach(f => {
      const profile = require('./profiles/' + f)
      profile.id = f.split('.').shift()
      profile.dailyTimer = profile.timers ? profile.timers.daily : 0
      profile.lootTimer = profile.timers ? profile.timers.loot : 0
      delete profile.timers
      profiles.push({ ...profile, loot: JSON.stringify(profile.loot || {}) })
    })
  db.run(`CREATE TABLE IF NOT EXISTS users(
    id VARCHAR NOT NULL, 
    _coins INT DEFAULT 0,
    xp INT DEFAULT 0,
    level INT DEFAULT 0,
    rep INT DEFAULT 0,
    loot JSON,
    birthday DATE,
    marry VARCHAR,
    dailyLevel INT DEFAULT 0,
    dailyTimer INT DEFAULT 0,
    lootTimer INT DEFAULT 0,
    about TEXT,
    PRIMARY KEY (id)
    )`)
  const stmt = db.prepare(`INSERT INTO users
  (id, _coins, xp, level, rep, loot, birthday, marry, dailyLevel, dailyTimer, lootTimer, about)
  VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`)
  for (const profile of profiles) {
    stmt.run(
      profile.id,
      profile._coins || 0,
      profile.xp || 0,
      profile.level || 0,
      profile.rep || 0,
      profile.loot,
      profile.birthday,
      profile.marry,
      profile.dailyLevel || 0,
      profile.dailyTimer || 0,
      profile.lootTimer || 0,
      profile.about || ''
    )
  }
  stmt.finalize()
})

db.serialize(() => {
  const loot = Object.entries(readWrite('loot.json'))
  db.run('CREATE TABLE IF NOT EXISTS loot(loot VARCHAR, cost INT)')
  const stmt = db.prepare('INSERT INTO loot(loot, cost) VALUES(?,?)')
  for (const row of loot) stmt.run(row[0], row[1])
  stmt.finalize()
})

db.serialize(() => {
  const roles = Object.entries(readWrite('roles.json'))
  db.run('CREATE TABLE IF NOT EXISTS roles(id VARCHAR, cost INT)')
  const stmt = db.prepare('INSERT INTO roles(id, cost) VALUES(?,?)')
  for (const row of roles) stmt.run(row[0], row[1])
  stmt.finalize()
})

db.serialize(() => {
  const deposits = Object.values(readWrite('bank_profiles.json'))
    .filter(({ deposit }) => deposit)
    .map(({ deposit, id }) => ({
      ...deposit,
      id,
    }))
  db.run(
    `CREATE TABLE IF NOT EXISTS deposits(
      id VARCHAR,
      sum INT,
      percent INT,
      deadline INT,
      PRIMARY KEY (id),
      FOREIGN KEY (id) REFERENCES users(id)
    )`
  )
  const stmt = db.prepare(
    'INSERT INTO deposits(id, sum, percent, deadline) VALUES(?,?,?,?)'
  )
  for (const row of deposits) stmt.run(row.id, row.sum, row.percent, row.deadline)
  stmt.finalize()
})

db.serialize(() => {
  const credits = Object.values(readWrite('bank_profiles.json'))
    .filter(({ credit }) => credit)
    .map(({ credit, id }) => ({
      ...credit,
      id,
    }))
  db.run(
    `CREATE TABLE IF NOT EXISTS credits(
      id VARCHAR,
      sum INT,
      percent INT,
      deadline INT,
      PRIMARY KEY (id),
      FOREIGN KEY (id) REFERENCES users(id)
    )`
  )
  const stmt = db.prepare(
    'INSERT INTO credits(id, sum, percent, deadline) VALUES(?,?,?,?)'
  )
  for (const row of credits) stmt.run(row.id, row.sum, row.percent, row.deadline)
  stmt.finalize()
})

db.serialize(() => {
  const bancrots = Object.values(readWrite('bank_profiles.json'))
    .filter(({ bancrot }) => bancrot)
    .map(({ bancrot, id }) => ({
      deadline: bancrot,
      id,
    }))
  db.run(`CREATE TABLE IF NOT EXISTS bancrots(
    id VARCHAR,
    deadline INT,
    PRIMARY KEY (id),
    FOREIGN KEY (id) REFERENCES users(id)
  )
  `)
  const stmt = db.prepare('INSERT INTO bancrots(id, deadline) VALUES(?,?)')
  for (const row of bancrots) stmt.run(row.id, row.deadline)
  stmt.finalize()
})

db.serialize(() => {
  db.run('CREATE INDEX userIdIndex ON users(id)')
  db.run('CREATE INDEX userLevelIndex ON users(level)')
  db.run('CREATE INDEX coinIndex ON users(_coins)')
  db.run('CREATE INDEX creditsIdIndex ON credits(id)')
  db.run('CREATE INDEX depositsIdIndex ON deposits(id)')
})

db.close()