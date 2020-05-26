const Discord = module.require("discord.js");
const akaneko = require("akaneko");
const colorSize = 60;
const rainbow = new Array(colorSize);
let counter = 0;

for (let i = 0, sinI = 0; i < colorSize; i++, sinI += 4) {
	const red = sin_to_hex(sinI, 0 * Math.PI * 2 / 3); // 0 deg
	const blue = sin_to_hex(sinI, 1 * Math.PI * 2 / 3); // 120 deg
	const green = sin_to_hex(sinI, 2 * Math.PI * 2 / 3); // 240 deg

	rainbow[i] = '#' + red + green + blue;
}

module.exports.run = async (client, message, args) => {
	if (message.channel.id !== "402114219438374913") return;
	const embed = new Discord.MessageEmbed()
		.setImage(akaneko.nsfw.hentai())
		.setColor(rainbow[counter]);
	message.channel.send(embed);
	counter = counter < colorSize - 1 ? ++counter : 0;
};

module.exports.help = {
	name: "hentai",
};

function sin_to_hex(i, phase) {
	const sin = Math.sin(Math.PI / colorSize * 2 * i + phase);
	const int = Math.floor(sin * 127) + 128;
	const hex = int.toString(16);

	return hex.length === 1 ? '0' + hex : hex;
}