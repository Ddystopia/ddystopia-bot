const redditConfig = {
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
  app_id: process.env.REDDIT_APP_ID,
  api_secret: process.env.REDDIT_API_SECRET,
  logs: false
}
const { randomInteger } = require('./randomInteger')
const { RandomReddit } = require('random-reddit')
const generesControl = {
  getGenre: genre => {
    if (!genre) return
    const genreArray = Object.entries(generesControl.genres).find(
      el => el[0].toLowerCase() === genre.toLowerCase()
    )
    if (!genreArray) return
    return genreArray[1][randomInteger(0, genreArray[1].length - 1)]
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
    anal: ['HentaiAnal', 'AnalHentai', 'Animebooty'],
    be: ['BisexualHentai'],
    yaoi: [
      'NoTraps',
      'YaoiGif',
      'YaoiPics',
      'NekoBoysNSFW',
      'YaoiNSFW',
      'Yaoi',
      'CuteTraps',
      'traphentai',
    ],
    masturbation: ['Sukebei', 'thighhighhentai', 'SoakedHentai', 'MasturbationHentai'],
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
      'HentaiHumiliation',
      'HentaiForniphilia',
    ],
  },
}
const reddit = new RandomReddit(redditConfig)

module.exports.reddit = {
  getImage: reddit.getImage.bind(reddit),
  getGenre: generesControl.getGenre,
}
