const Discord = module.require("discord.js");
const client = require("nekos.life");
const { nsfw } = new client();
// prettier-ignore
const generes = ["randomHentaiGif", "pussy", "nekoGif", "neko", "lesbian", "kuni", "cumsluts", "classic", "boobs", "bJ", "anal", "avatar", "yuri", "trap", "tits", "girlSoloGif", "girlSolo", "pussyWankGif", "pussyArt", "kemonomimi", "kitsune", "keta", "holo", "holoEro", "hentai", "futanari", "femdom", "feetGif", "eroFeet", "feet", "ero", "eroKitsune", "eroKemonomimi", "eroNeko", "eroYuri", "cumArts", "blowJob", "spank", "gasm"]
let counter = 0;

const rainbow = require("../utils/rainbow");
const randomInteger = require("../utils/randomInteger");

module.exports.run = async (client, message, args) => {
  if (message.channel.id !== "402114219438374913") return;
  let number = +args[1] || +args[0] || 1;
  if (number > 10) number = 10;
  const genre = generes.includes(args[0])
    ? args[0]
    : generes[randomInteger(0, generes.length - 1)];
  for (let i = number; i >= 1; i--) {
    const urlObj = await nsfw[genre]();
    const embed = new Discord.MessageEmbed()
      .setColor(rainbow[counter])
      .setImage(urlObj.url);
    message.channel.send(embed);
    counter = counter < 60 - 1 ? ++counter : 0;
  }
};

module.exports.help = {
  name: "hentai",
};
