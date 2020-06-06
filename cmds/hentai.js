const Discord = require('discord.js')
const redditConfig = require('../redditConfig.json')
const { RandomReddit } = require('random-reddit')
const MAX_IMAGES_COUNT = 15
const generesControl = {
  random: () => {
    const values = Object.values(generesControl.genres)
    const subReddit = values[randomInteger(0, values.length - 1)]
    return subReddit[randomInteger(0, subReddit.length - 1)]
  },
  getGenre: genre => {
    const genreArray = Object.entries(generesControl.genres).find(
      el => el[0].toLowerCase() === genre.toLowerCase()
    )[1]
    return genreArray[randomInteger(0, genreArray.length - 1)]
  },
  genres: {
    common: [
      'hentai',
      'Paizuri',
      'PublicHentai',
      'Tanime',
      'uncensoredhentai',
      'SoakedHentai',
      'UncensoredHentai',
      'AnimeArmpits',
      'Buttfangs',
      'rippedanimelegwear',
      'ElfHentai',
      'MaidHentai',
      'HentaiHearts',
      'BisexualHentai',
      'OfficeLady',
      'animepointyears',
      'Heterochromiahentai',
      'MechanicalSluts',
    ],
    cum: ['HentaiCumsluts', 'CumHentai', 'DeepCreamPy', 'HentaiBreeding'],
    neko: ['Nekomimi'],
    boobs: ['Chiisaihentai', 'Dekaihentai', 'Animehandbras', '2DTittyTouching'],
    anal: ['HentaiAnal', 'AnalHentai', 'Animebooty'],
    yuri: ['SoakedHentai', '2DTittyTouching'],
    be: ['BisexualHentai'],
    yaoi: ['NoTraps', 'YaoiGif', 'YaoiPics', 'NekoBoysNSFW', 'YaoiNSFW', 'Yaoi', 'CuteTraps'],
    trap: ['traphentai'],
    masturbation: ['Sukebei', 'thighhighhentai', 'SoakedHentai', 'MasturbationHentai'],
    futanari: ['FutanariHentai'],
    feet: ['AnimeLegs', 'AshiHentai'],
    oral: ['OralHentai'],
    tentacles: ['Tentai', 'HentaiBeast'],
    funny: ['SubwayHentai'],
    animal: ['kemonomimi', 'inumimi', 'Nekomimi'],
    bdsm: [
      'StuckHentai',
      'Hentaibondage',
      'HentaiPetgirls',
      'Animebodysuits',
      'EcchiBondage',
      'Usagimimi',
      'HentaiSmothering',
      'VacuumHentai',
      'HentaiHumiliation',
      'HentaiForniphilia',
      'HentaiBreathPlay',
    ],
  },
}
let counter = 0

const rainbow = require('../utils/rainbow')
const randomInteger = require('../utils/randomInteger')

const reddit = new RandomReddit(redditConfig)

module.exports.run = async (client, message, args) => {
  if (!message.channel.nsfw) return
  let number = +args[1] || +args[0] || 1
  if (number > MAX_IMAGES_COUNT) number = MAX_IMAGES_COUNT
  for (let i = number; i >= 1; i--) {
    const genre = generesControl.getGenre(args[0]) || generesControl.random()
    const url = await reddit.getImage(genre)
    const embed = new Discord.MessageEmbed().setColor(rainbow[counter]).setImage(url)
    message.channel.send(embed)
    counter = counter < 60 - 1 ? ++counter : 0
  }
}

module.exports.help = {
  name: 'hentai',
}
