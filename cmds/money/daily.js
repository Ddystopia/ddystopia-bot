const randomInteger = require('../../utils/randomInteger.js')
const readWrite = require('../../utils/readWriteFile')
const formatDuration = require('../../utils/formatDuration')
const SECONDS_COOLDOWN = 60 * 60 * 12

module.exports.run = async (client, message, args) => {
  const profile = readWrite.profile(message.author.id)
	if (profile.bancrot) return

  if (Date.now() - profile.timers.daily < 1000 * SECONDS_COOLDOWN)
    return message.reply(
      `Вы уже получили свою долю, следующий раз получить можно через ${formatDuration(
        SECONDS_COOLDOWN - (Date.now() - profile.timers.daily) / 1000
      )}`
    )
  const betNum = randomInteger(-30, 20) + 30
  const realNum = randomInteger(0, 50)
  const sum = betNum == realNum ? 1000 * 10 : 1000
  profile.coins += sum
  profile.timers.daily = Date.now()

  readWrite.profile(message.author.id, profile)
  message.reply(
    `Вы получили ${sum} ${currency}, следующий раз получить можно через 12 часов`
  )
}

module.exports.help = {
  name: 'daily',
}
