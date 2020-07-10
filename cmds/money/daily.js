const { MessageEmbed } = require('discord.js')
const User = require('../../classes/User')
const rainbow = require('../../utils/rainbow')
const formatDuration = require('../../utils/formatDuration')

const SECONDS_COOLDOWN = 60 * 60 * 12
const DAILY_UP_COST_MUL = 7

module.exports.run = async (client, message, args) => {
  const user = await User.getOrCreateUser(message.author.id)
  if (user.bancrot) return

  switch (args[0]) {
    case 'up':
      for (let i = 0; i < (+args[1] || 1); i++) {
        const nextLevelCost = calcLevelCost(user.dailyLevel) * DAILY_UP_COST_MUL + 100
        if (user.coins < nextLevelCost) continue

        user.coins -= nextLevelCost
        user.dailyLevel++
      }

      message.reply(`У вас ${user.dailyLevel} уровень`)
      user.save()
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
          .addField('Уровень', user.dailyLevel)
          .addField('Сейчас ваш daily', calcLevelCost(user.dailyLevel) + currency)
          .addField(
            'Цена до следующего',
            calcLevelCost(user.dailyLevel) * DAILY_UP_COST_MUL + 100 + currency
          )
          .addField('Следующее daily', calcLevelCost(user.dailyLevel + 1) + currency)
      )
    default: {
      if (Date.now() - user.timers.daily < 1000 * SECONDS_COOLDOWN)
        return message.reply(
          `Вы уже получили свою долю, следующий раз получить можно через ${formatDuration(
            SECONDS_COOLDOWN - (Date.now() - user.timers.daily) / 1000
          )}`
        )
      const sum = calcLevelCost(user.dailyLevel)
      user.coins += sum
      user.timers.daily = Date.now()

      user.save()
      message.reply(
        `Вы получили ${sum}${currency}, следующий раз получить можно через 12 часов`
      )
      break
    }
  }
}

const calcLevelCost = level => {
  let first = 0
  let second = 0
  level += 2

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
