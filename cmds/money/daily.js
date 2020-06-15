const randomInteger = require('../../utils/randomInteger.js')
const readWrite = require('../../utils/readWriteFile')

module.exports.run = async (client, message, args) => {
  const profile = readWrite.profile(message.author.id)

  if (Date.now() - profile.resentDaily < 1000 * 60 * 60 * 12)
    return message.reply(
      `Вы уже получили свою долю, следующий раз получить можно через ${formatDuration(
        60 * 60 * 12 - (Date.now() - profile.resentDaily) / 1000
      )}`
    )
  const betNum = randomInteger(-30, 20) + 30
  const realNum = randomInteger(0, 50)
  const sum = betNum == realNum ? 1000 * 10 : 1000
  profile.coins += sum
  profile.resentDaily = Date.now()

	readWrite.profile(message.author.id, profile)
  message.reply(`Вы получили ${sum} монет, следующий раз получить можно через 12 часов`)
}

module.exports.help = {
  name: 'daily',
}

function formatDuration(seconds) {
  let time = {
      year: 31536000,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    },
    res = []

  if (seconds === 0) return 'now'

  for (let key in time) {
    if (seconds >= time[key]) {
      let val = Math.floor(seconds / time[key])
      res.push((val += val > 1 ? ' ' + key + 's' : ' ' + key))
      seconds = seconds % time[key]
    }
  }

  const result =
    res.length > 1 ? res.join(', ').replace(/,([^,]*)$/, ' and' + '$1') : res[0]
  return result
    .replace('hours', 'часов')
    .replace('hour', 'час')
    .replace('minutes', 'минут')
    .replace('minute', 'минута')
    .replace('seconds', 'секунд')
    .replace('second', 'секунда')
    .replace('and', 'и')
}
