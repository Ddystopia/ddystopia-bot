const randomInteger = require('../../utils/randomInteger')
const formatDuration = require('../../utils/formatDuration')
const { addLoot, removeLoot } = require('../../utils/lootActions')
const readWrite = require('../../utils/readWriteFile.js')
const SECONDS_COOLDOWN = 60 * 60 * 24
const MAX_DAILY_LOOT_COST = 5000

module.exports.run = async (client, message, args, command) => {
  const loot = readWrite.file('loot.json')
  switch (command) {
    case 'loot': {
      const profile = readWrite.profile(message.author.id)
      if (Date.now() - profile.timers.loot < 1000 * SECONDS_COOLDOWN)
        return message.reply(
          `Вы уже получили свою долю, следующий раз получить можно через ${formatDuration(
            SECONDS_COOLDOWN - (Date.now() - profile.timers.loot) / 1000
          )}`
        )
      const winnedLoot = calcLoot(loot, MAX_DAILY_LOOT_COST)
      addLoot(profile, winnedLoot)

      profile.timers.loot = Date.now()
      readWrite.profile(message.author.id, profile)
      message.reply(
        `Вы получили ${winnedLoot}, следующий раз получить можно через 24 часа`
      )
      break
    }

    case 'giveloot':
      if (!message.mentions.users.first()) return
      const lootArray = args
        .slice(1)
        .join('')
        .split('|')
        .filter(el => !!el)
        .filter(item => !!loot[item])

      if (lootArray.length < 1) return message.reply('Не продаётся')
      const profileFrom = readWrite.profile(message.author.id)
      const profileTill = readWrite.profile(message.mentions.users.first().id)
      if (Object.keys(profileFrom.loot).some(item => !loot[item]))
        return message.reply('У вас такого нет')

      lootArray.forEach(item => addLoot(profileTill, item))
      lootArray.forEach(item => removeLoot(profileFrom, item))

      message.react('✅')
      readWrite.profile(message.author.id, profileFrom)
      readWrite.profile(message.mentions.users.first().id, profileTill)
      break

    case 'lootbox': {
      const profile = readWrite.profile(message.author.id)
      if (!profile.loot['🎁']) return message.reply('Нечего открывать ¯\\_(ツ)_/¯')
      removeLoot(profile, '🎁')
      const number = randomInteger(0, 100)

      let maxCost = 0
      if (number === 0) maxCost = 2e4
      else if (number > 90) maxCost = 9e6
      else if (number > 80) maxCost = 1e6
      else if (number > 70) maxCost = 2e4
      else maxCost = MAX_DAILY_LOOT_COST

      const winnedLoot = calcLoot(loot, maxCost)
      addLoot(profile, winnedLoot)
      message.reply(`Вы получили ${winnedLoot}`)
    }
  }
}

function calcLoot(loot, maxCost = MAX_DAILY_LOOT_COST) {
  const loots = Object.entries(loot)
    .filter(line => line[1] <= maxCost)
    .map(item => item[0])
  const winnedLoot = loots[randomInteger(0, loots.length - 1)]
  return winnedLoot
}

module.exports.help = {
  aliases: ['loot', 'giveloot', 'lootbox'],
  cmdList: true,
}
