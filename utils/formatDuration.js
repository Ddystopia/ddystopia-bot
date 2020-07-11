module.exports.formatDuration = seconds => {
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
