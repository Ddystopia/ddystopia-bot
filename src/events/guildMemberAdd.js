const { Guild } = require('../models/Guild')

module.exports.getCallback = client => async member => {
  const { greetingChannel, baseRole } = await Guild.getOrCreate(member.guild.id)
  if (!greetingChannel || member.user.bot) return
  const role = member.guild.roles.cache.get(baseRole)
  if (!member || !role) return
  member.roles.add(role)
  client.commands.get('greeting').run({ member }, [greetingChannel])
}

module.exports.event = 'guildMemberAdd'
