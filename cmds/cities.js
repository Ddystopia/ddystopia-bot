let words = []

module.exports.run = async (client, message, propArgs) => {
  if (message.author.bot) return
  const args = propArgs || message.content.split(/\s+/g)
  const word = toFormat(args[0])
  switch (args[0]) {
    case 'clear':
      words = []
      message.react('✅')
      break
    case 'getWords':
      let json = JSON.stringify(words).split('')
      while (json.length) {
        message.channel.send(json.slice(0, 1900).join(''))
        json = json.slice(1900)
      }
      break
    case 'setWords':
      try {
        const json = message.content.match(/\[.+]/)[0]
        const newWords = JSON.parse(json)
        words = newWords
      } catch (e) {
        return message.react('❌')
      }
      message.react('✅')
      break
    case 'symbol':
      message.reply(words.length > 0 ? words[words.length - 1].split('').pop() : 'any')
      break
    default:
      if (!word) return
      if (args.length !== 1) return
      if (isCorrect(word, words)) {
        words.push(word)
        message.react('✅')
      } else {
        message.react('❌')
        message.delete({ timeout: 3000 })
      }
      break
  }
}

function toFormat(word) {
  if (!word) return null
  word = word
    .toLowerCase()
    .replace(/[ьъы]$/g, '')
    .replace(/ё/g, 'е')
  return word
}

function isCorrect(word, words) {
  const correctLastSymbol =
    !words.length || word[0] === words[words.length - 1].split('').pop()
  const simpleLanguage = /^[a-z]+$/.test(word) || /^[а-я]+$/.test(word)
  return !words.includes(word) && correctLastSymbol && word.length > 1 && simpleLanguage
}

module.exports.help = {
  name: 'cities',
}
