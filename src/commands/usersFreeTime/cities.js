const { Guild } = require('../../models/Guild')
const { CitiesGameWord } = require('../../models/CitiesGameWord')

module.exports.run = async (message, args) => {
  const { wordsGameChannels } = await Guild.getOrCreate(message.guild.id)
  if (!wordsGameChannels.includes(message.channel.id)) return
  // let words = await CitiesGameWord.find({ channelId: message.channel.id })
  // words = words.sort((a, b) => a.date - b.date)
  switch (args[0]) {
    case 'очистить':
    case 'clear':
      if (!message.member.hasPermission('MANAGE_MESSAGES')) return
      await CitiesGameWord.deleteMany({ channelId: message.channel.id })
      message.react('✅')
      break
    case 'старт':
    case 'start': {
      if (!message.onReady) return
      const filter = m => !m.content.includes(' ') && !m.author.bot
      const collector = message.channel.createMessageCollector(filter)

      collector.on('collect', async msg => {
        const word = toFormat(msg.content)
        const words = await CitiesGameWord.find({ channelId: message.channel.id })
        if (isCorrect(word, words)) {
          new CitiesGameWord({ word, channelId: message.channel.id }).save()
          msg.react('✅')
        } else {
          msg.react('❌')
          msg.delete({ timeout: 3000 }).catch(() => {})
        }
      })
      break
    }
    case 'getWords': {
      const words = await CitiesGameWord.find({ channelId: message.channel.id })
      let json = JSON.stringify(words).split('')
      while (json.length) {
        message.channel.send(json.slice(0, 1900).join(''))
        json = json.slice(1900)
      }
      break
    }
    case 'addWords': {
      if (!message.member.hasPermission('MANAGE_MESSAGES')) return
      try {
        const json = message.content.match(/\[.+]/)[0]
        const newWords = JSON.parse(json)
        if (!Array.isArray(newWords)) throw new Error()
        newWords.forEach(word =>
          new CitiesGameWord({ channelId: message.channel.id, word }).save()
        )
      } catch (e) {
        return message.react('❌')
      }
      message.react('✅')
      break
    }
    case 'symbol': {
      const words = await CitiesGameWord.find({ channelId: message.channel.id })
      message.reply(words.length > 0 ? words[words.length - 1].split('').pop() : 'any')
      break
    }
  }
}

function toFormat(word) {
  if (!word) return null
  return word
    .toLowerCase()
    .replace(/[ьъы]$/g, '')
    .replace(/ё/g, 'е')
}

function isCorrect(word, words) {
  const correctLastSymbol =
    !words.length || word[0] === words[words.length - 1].word.split('').pop()
  const simpleLanguage = /^[-a-z]+$/.test(word) || /^[-а-я]+$/.test(word)
  return (
    !words.some(item => item.word === word) &&
    correctLastSymbol &&
    word.length > 1 &&
    simpleLanguage
  )
}

module.exports.help = {
  name: 'cities',
  aliases: ['words', 'слова', 'города'],
}
