module.exports.getCallback = client => async guild => {
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
      const guildDB = guild.getOrCreate(guild.id)
      guildDB.bankruptRole = id
      guildDB.save()
    })
  client.intervals.set(guild.id, [])
  client.timeouts.set(guild.id, [])
  const admins = guild.members.cache.filter(m => m.hasPermission('ADMINISTRATOR'))
  admins.forEach(m => {
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
