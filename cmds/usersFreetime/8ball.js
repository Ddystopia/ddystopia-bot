const { MessageEmbed } = require('discord.js')
const randomInteger = require('../../utils/randomInteger')
const answers = [
  'Бесспорно',
  'Предрешено',
  'Никаких сомнений',
  'Определённо да',
  'Можешь быть уверен в этом',

  'Мне кажется — «да»',
  'Вероятнее всего',
  'Хорошие перспективы',
  'Знаки говорят — «да»',
  'Да',

  'Пока не ясно, попробуй снова',
  'Спроси позже',
  'Лучше не рассказывать',
  'Сейчас нельзя предсказать',
  'Сконцентрируйся и спроси опять',

  'Даже не думай',
  'Мой ответ — «нет»',
  'По моим данным — «нет»',
  'Перспективы не очень хорошие',
  'Весьма сомнительно',
]
const colors = ['#65f70a', '#fcba03', '#0a5ccf', '#f01352']
module.exports.run = async message => {
  const indexOfRes = randomInteger(0, answers.length - 1)
  const embed = new MessageEmbed()
    .setColor(colors[Math.ceil(((indexOfRes + 1) / answers.length) * colors.length) - 1])
    .setTitle('8Ball')
    .addField('\u200B', answers[indexOfRes])
    .setImage('https://upload.wikimedia.org/wikipedia/commons/e/eb/Magic_eight_ball.png')
  message.channel.send(embed)
}

module.exports.help = {
  name: '8ball',
}
