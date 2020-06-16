const { MessageEmbed } = require('discord.js')
const randomInteger = require('../../utils/randomInteger')
const rainbow = require('../../utils/rainbow.js')

module.exports.run = async (client, message, args) => {
  if (args.length < 2) return
  const embed = new MessageEmbed().setColor(rainbow()).setTitle('Шипперим!!!')
  const percent = randomInteger(0, 100)
  let endPhrase = ''

  if (percent === 100) endPhrase = 'просто идеально!!!'
  else if (percent > 85) endPhrase = 'замечательно!!!'
  else if (percent > 50) endPhrase = 'в принципе, намана'
  else if (percent > 30) endPhrase = 'ууу...'
  else if (percent > 0) endPhrase = 'им определённо не стоит быть вместе...'
  else if (percent === 0) endPhrase = 'это провал...'

	embed.addField(
    'И что там у нас?',
    `${args[0]} и ${args[1]} подходят друг другу на ${percent}%, ${endPhrase}`
  )

  message.reply(embed)
}

module.exports.help = {
  name: 'ship',
}
