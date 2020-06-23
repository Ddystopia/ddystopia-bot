const { MessageEmbed } = require('discord.js')
const randomInteger = require('../../utils/randomInteger.js')
const rainbow = require('../../utils/rainbow')
const readWrite = require('../../utils/readWriteFile')
const formatDuration = require('../../utils/formatDuration')

const SECONDS_COOLDOWN = 60 * 60 * 12

module.exports.run = async (client, message, args) => {
  const profile = readWrite.profile(message.author.id)
  if (profile.bancrot) return

  switch (args[0]) {
    case 'up':
      for (let i = 0; i < (+args[1] || 1); i++) {
        const nextLevelCost = calcLevelCost(profile.dailyLevel) * 15 + 100
        if (profile.coins < nextLevelCost) continue

        profile.coins -= nextLevelCost
        profile.dailyLevel++
      }

      message.reply(`У вас ${profile.dailyLevel} уровень`)
      readWrite.profile(message.author.id, profile)
      return message.react('✅')

    case 'level':
      return message.reply(
        new MessageEmbed()
          .setColor(rainbow())
          .setTitle('daily')
          .setThumbnail(
            'https://cdn.discordapp.com/attachments/402109825896415232/692820764478668850/yummylogo.jpg'
          )
          .setTimestamp()
          .addField('Уровень', profile.dailyLevel)
          .addField('Сейчас ваш daily', calcLevelCost(profile.dailyLevel) + currency)
          .addField(
            'Цена следующего',
            calcLevelCost(profile.dailyLevel) * 15 + 100 + currency
          )
      )
    default:
      if (Date.now() - profile.timers.daily < 1000 * SECONDS_COOLDOWN)
        return message.reply(
          `Вы уже получили свою долю, следующий раз получить можно через ${formatDuration(
            SECONDS_COOLDOWN - (Date.now() - profile.timers.daily) / 1000
          )}`
        )
      const sum = calcLevelCost(profile.dailyLevel)
      profile.coins += sum
      profile.timers.daily = Date.now()

      readWrite.profile(message.author.id, profile)
      message.reply(
        `Вы получили ${sum}${currency}, следующий раз получить можно через 12 часов`
      )
      break
  }
}

const calcLevelCost = level => {
  let first = 0
  let second = 0

  if (level <= 7) {
    first = 0
    second = 580
  } else if (level < 10) {
    first = 1.5
    second = 760
  } else {
    first = 0.6
    second = 850
  }

  return Math.floor(Math.log(level - first) * second)
}

module.exports.help = {
  name: 'daily',
}
