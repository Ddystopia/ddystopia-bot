const { MessageEmbed } = require('discord.js')
const client = require('nekos.life')
const { nsfw } = new client()
const { reddit } = require('../../utils/redditHentai')
const { rainbow } = require('../../utils/rainbow')
const { randomInteger } = require('../../utils/randomInteger')

const MAX_IMAGES_COUNT = 15
// prettier-ignore
const generes = ["randomHentaiGif", "pussy", "nekoGif", "neko", "lesbian", "kuni", "cumsluts", "classic", "boobs", "bJ", "anal", "avatar", "yuri", "trap", "tits", "girlSoloGif", "girlSolo", "pussyWankGif", "pussyArt", "kemonomimi", "kitsune", "keta", "holo", "holoEro", "hentai", "futanari", "femdom", "feetGif", "eroFeet", "feet", "ero", "eroKitsune", "eroKemonomimi", "eroNeko", "eroYuri", "cumArts", "blowJob", "spank", "gasm"]

const getImageURL = async genreProps => {
  const randImage = () => nsfw[generes[randomInteger(0, generes.length - 1)]]()
  if (!genreProps || !isNaN(+genreProps)) return randImage()
  let genre = generes.find(el => el.toLowerCase() === genreProps.toLowerCase())
  if (genre) return nsfw[genre]()
  genre = reddit.getGenre(genreProps)
  if (!genre) return randImage()
  try {
    const url = await reddit.getImage(genre)
    return { url }
  } catch (e) {
    return randImage()
  }
}

module.exports.run = async (message, args) => {
  if (!message.channel.nsfw) return
  let number = +args[1] || +args[0] || 1
  if (number > MAX_IMAGES_COUNT) number = MAX_IMAGES_COUNT
  for (let i = number; i >= 1; i--) {
    const urlObj = await getImageURL(args[0])
    const embed = new MessageEmbed()
      .setColor(rainbow())
      .setImage(urlObj.url)
      .setFooter(urlObj.url)
    message.channel.send(embed)
  }
}

module.exports.help = {
  name: 'hentai',
	cooldown: 8,
}
