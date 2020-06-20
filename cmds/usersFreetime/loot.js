const randomInteger = require('../../utils/randomInteger')
const formatDuration = require('../../utils/formatDuration')
const { addLoot, removeLoot } = require('../../utils/lootActions')
const readWrite = require('../../utils/readWriteFile.js')
const SECONDS_COOLDOWN = 60 * 60 * 24
const loot = readWrite.file('loot.json')

module.exports.run = async (client, message, args, command) => {
  switch (command) {
    case 'loot':
      const profile = readWrite.profile(message.author.id)

      if (Date.now() - profile.timers.loot < 1000 * SECONDS_COOLDOWN)
        return message.reply(
          `Вы уже получили свою долю, следующий раз получить можно через ${formatDuration(
            SECONDS_COOLDOWN - (Date.now() - profile.timers.loot) / 1000
          )}`
        )
      const loots = Object.entries(loot)
        .filter(line => line[1] < 5000)
        .map(item => item[0])
      const winnedLoot = loots[randomInteger(0, loots.length - 1)]
			addLoot(profile, winnedLoot)
			
      profile.timers.loot = Date.now()
      readWrite.profile(message.author.id, profile)
      message.reply(
        `Вы получили ${winnedLoot}, следующий раз получить можно через 24 часа`
      )
      break
    case 'giveloot':
      if (!message.mentions.users.first()) return
      if (!loot[args[1]]) return
      const profileFrom = readWrite.profile(message.author.id)
      const profileTill = readWrite.profile(message.mentions.users.first().id)
      if (!profileFrom.loot[args[1]]) return message.reply('У вас такого нет')

			addLoot(profileTill, args[1])
			removeLoot(profileFrom, args[1])

			message.react('✅')
      readWrite.profile(message.author.id, profileFrom)
      readWrite.profile(message.mentions.users.first().id, profileTill)
  }
}

module.exports.help = {
  names: ['loot', 'giveloot'],
  cmdList: true,
}