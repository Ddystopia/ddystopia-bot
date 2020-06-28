const readWrite = require('../../utils/readWriteFile')
let words = readWrite('words.json', null, [])

module.exports.run = async (client, message, args) => {
  // switch (args[0]) {
  //   case 'clear':
  //     if (!message.member.hasPermission('MANAGE_MESSAGES')) return
  //     words = []
  //     readWrite('words.json', words)
  //     message.react('✅')
  //     break
  //   case 'start': {
  //     if (!message.onReady) return
  //     const filter = m => !m.content.includes(' ')
  //     const collector = message.channel.createMessageCollector(filter)

  //     collector.on('collect', msg => {
  //       const word = toFormat(msg.content)
  //       if (msg.author.bot) return
  //       if (isCorrect(word, words)) {
  //         words.push(word)
  //         readWrite('words.json', words)
  //         msg.react('✅')
  //       } else {
  //         msg.react('❌')
  //         msg.delete({ timeout: 3000 }).catch(() => {})
  //       }
  //     })
  //     break
  //   }
  //   case 'getWords': {
  //     let json = JSON.stringify(words).split('')
  //     while (json.length) {
  //       message.channel.send(json.slice(0, 1900).join(''))
  //       json = json.slice(1900)
  //     }
  //     break
  //   }
  //   case 'addWords':
  //     if (!message.member.hasPermission('MANAGE_MESSAGES')) return
  //     try {
  //       const json = message.content.match(/\[.+]/)[0]
  //       const newWords = JSON.parse(json)
  //       if (!Array.isArray(newWords)) throw new Error()
  //       words = words.concat(newWords)
  //       readWrite('words.json', words)
  //     } catch (e) {
  //       return message.react('❌')
  //     }
  //     message.react('✅')
  //     break
  //   case 'symbol':
  //     message.reply(words.length > 0 ? words[words.length - 1].split('').pop() : 'any')
  //     break
  // }
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
