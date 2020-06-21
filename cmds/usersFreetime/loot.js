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
      const lootArray = args
        .slice(1)
        .join('')
        .split('|')
        .filter(el => !!el)
      if (lootArray.some(item => !loot[item]))
        return message.reply('Что-то из этого не продаётся')
      const profileFrom = readWrite.profile(message.author.id)
      const profileTill = readWrite.profile(message.mentions.users.first().id)
      if (Object.keys(profileFrom.loot).some(item => !loot[item]))
        return message.reply('У вас такого нет')

      lootArray.forEach(item => addLoot(profileTill, item))
      lootArray.forEach(item => removeLoot(profileFrom, item))

      message.react('✅')
      readWrite.profile(message.author.id, profileFrom)
      readWrite.profile(message.mentions.users.first().id, profileTill)
  }
}

module.exports.help = {
  names: ['loot', 'giveloot'],
  cmdList: true,
}
