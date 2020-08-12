const { Guild } = require('../models/Guild')
const { Loot } = require('../models/Loot')

const defaultLoot = [
  { loot: '🎟️', cost: 5e6 },
  { loot: '🌑', cost: 2e6 },
  { loot: '🧿', cost: 1e6 },
  { loot: '🎮', cost: 5e5 },
  { loot: '🛫', cost: 1e5 },
  { loot: '✈️', cost: 1e5 },
  { loot: '🎩', cost: 2e4 },
  { loot: '🏆', cost: 2e4 },
  { loot: '💍', cost: 1e4 },
  { loot: '🚗', cost: 1e4 },
  { loot: '🛩️', cost: 1e4 },
  { loot: '🖼️', cost: 1e4 },
  { loot: '🧬', cost: 1e4 },
  { loot: '🎃', cost: 8e3 },
  { loot: '🛡️', cost: 8e3 },
  { loot: '🔪', cost: 8e3 },
  { loot: '🗡️', cost: 8e3 },
  { loot: '🏹', cost: 8e3 },
  { loot: '⚔️', cost: 8e3 },
  { loot: '💣', cost: 8e3 },
  { loot: '🔫', cost: 8e3 },
  { loot: '🍣', cost: 5e3 },
  { loot: '🍤', cost: 5e3 },
  { loot: '🃏', cost: 3e3 },
  { loot: '🎲', cost: 2e3 },
  { loot: '🎨', cost: 2e3 },
  { loot: '📯', cost: 2e3 },
  { loot: '🧪', cost: 2e3 },
  { loot: '🎁', cost: 2e3 },
  { loot: '🍕', cost: 1e3 },
  { loot: '📀', cost: 1e3 },
  { loot: '⏰', cost: 1e3 },
  { loot: '🧩', cost: 1e3 },
  { loot: '🍔', cost: 1e3 },
  { loot: '🍟', cost: 1e3 },
  { loot: '🌭', cost: 1e3 },
  { loot: '🥐', cost: 1e3 },
  { loot: '🍜', cost: 1e3 },
  { loot: '🥢', cost: 1e3 },
  { loot: '💌', cost: 1e3 },
  { loot: '🍭', cost: 1e3 },
  { loot: '🥁', cost: 300 },
  { loot: '🍏', cost: 250 },
  { loot: '🥔', cost: 100 },
  { loot: '🍆', cost: 100 },
  { loot: '🎈', cost: 100 },
]

module.exports.getCallback = client => async guild => {
  client.intervals.set(guild.id, [])
  client.timeouts.set(guild.id, [])

  defaultLoot.forEach(lootRow => new Loot({ ...lootRow, guildId: guild.id }).save())

  guild.roles
    .create({
      data: {
        name: 'Банкрот',
        color: '#4a412a',
        position: guild.me.roles.highest.position,
        mentionable: true,
      },
      reason: 'Роль для банкротов, удалите, если не хотите иметь команду `bank`',
    })
    .then(({ id }) => {
      const guildDB = Guild.getOrCreate(guild.id)
      guildDB.bankruptRole = id
      guildDB.save()
    })

  guild.members.cache
    .filter(m => m.hasPermission('ADMINISTRATOR'))
    .forEach(m => {
      m.user
        .send(
          `Здравствуйте! Извините, что беспокою, но не могли бы вы ознакомится с тем, как настроить меня для вашего чудесного сервера?
Сделать вы это можете, введя команду help у себя на сервере и пролистав до последней страницы. Обычно, мой префикс "${process.env.PREFIX}", но вы можете его поменять в любую минуту!
Спасибо вам, что пригласили меня на ваш сервер.`
        )
        .catch(() => {})
    })
}

module.exports.event = 'guildCreate'
