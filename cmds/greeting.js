const Discord = module.require('discord.js')
// const fs = require('fs');
// const client = new Discord.Client();

const rainbow = require('../utils/rainbow.js')
const randomInteger = require('../utils/randomInteger.js')
const helloGifs = [
  'https://i.ibb.co/mCsGdhF/209127.gif',
  'https://i.ibb.co/10Pz7tt/178892703000202.gif',
  'https://i.ibb.co/hCxfr5y/191685417001202.gif',
  'https://i.ibb.co/CWQb0kr/e03d7b19e67292f6e95e71d6e46161464b1a6f2er1-560-533-hq.gif',
  'https://i.ibb.co/x2bt1nj/e4d09b2f8273494a10e003bee7951b82.gif',
  'https://i.ibb.co/K7s860v/ezgif-4-95469e1722e5.gif',
  'https://i.ibb.co/YD8NGBC/giphy.gif',
  'https://i.ibb.co/JnpVcDr/rgdthb.gif',
  'https://i.ibb.co/tP98WJy/Silent-Energetic-Conure-small.gif',
  'https://i.ibb.co/0DB5M6R/tenor.gif',
  'https://i.ibb.co/s1dvfx0/9V6v.gif',
  'https://i.ibb.co/dP53hy4/20c2c7bc21fbfa535f09356c954b03cf.gif',
]

let colorСounter = randomInteger(3, 10)
let gifsСounter = randomInteger(1, 5)

module.exports.run = async (client, member) => {
  if (colorСounter >= 60) colorСounter = 0
  if (gifsСounter >= helloGifs.length) gifsСounter = 0

  const channel = member.guild.channels.cache.find(ch => ch.id == '692796617656369292')

  const embed = new Discord.MessageEmbed()
    .setColor(rainbow[colorСounter++])
    .setTitle('Приветствие')
    .setDescription('')
    .setThumbnail(
      'https://cdn.discordapp.com/attachments/402109825896415232/692820764478668850/yummylogo.jpg'
    )
    .addField(
      'Здраствуйте!',
      'Добро пожаловать на официальный Discord сервер YummyAnime!'
    )
    .addField(
      'Внимание!',
      'Перед тем, как начать своё увлекательное путешествие по нашему уютному серверу, пожалуйста, не поленитесь и прочтите правила, которые вы можете найти в закрепленных сообщениях данного канала.'
    )
    .addField(
      'Краткий гид:',
      `В разделе "мероприятия & ивенты" вы можете найти все актуальные, запланированные и прошедшие мероприятия, узнать о новостях мира аниме и ознакомиться с более полной версией правил.
		В разделе "чаты" вы можете общаться со своими единомышленниками на различные темы, вместе смеяться над мемами и другим развлекательным контентом.
		Раздел "зона отдыха" представлен несколькими голосовыми каналами, в которых вы можете общаться и слушать музыку.
		Для тех, кто любит игры, создан отдельный раздел "игровая", в котором вы найдете голосовые каналы с ограниченным числом вступающих, чтобы вас не отвлекали посторонние.
		Надеемся, что вы хорошо проведёте время!`
    )
    .setImage(helloGifs[gifsСounter++])
    .setTimestamp()

  channel.send(`${member}`)
  channel.send(embed)
}

module.exports.help = {
  name: 'greeting',
}
