const Discord = module.require('discord.js');
// const fs = require('fs');
// const client = new Discord.Client();

const colorSize = 60;
const rainbow = new Array(colorSize);
const helloGifs = [
	'https://cdn.discordapp.com/attachments/402109825896415232/692830995577176185/e4d09b2f8273494a10e003bee7951b82.gif',
	'https://cdn.discordapp.com/attachments/402109825896415232/692830999423221830/ezgif-4-95469e1722e5.gif',
	'https://cdn.discordapp.com/attachments/402109825896415232/692831004481814635/20c2c7bc21fbfa535f09356c954b03cf.gif',
	'https://cdn.discordapp.com/attachments/402109825896415232/692837783592763442/giphy.gif',
	'https://cdn.discordapp.com/attachments/402109825896415232/692831007686262805/178892703000202.gif',
	'https://cdn.discordapp.com/attachments/402109825896415232/692837766572015727/191685417001202.gif',
];

let colorСounter = randomInteger(3, 10);
let gifsСounter = randomInteger(1, 5);

for (let i = 0, sinI = 0; i < colorSize; i++, sinI += 4) {
	const red = sin_to_hex(sinI, 0 * Math.PI * 2 / 3); // 0 deg
	const blue = sin_to_hex(sinI, 1 * Math.PI * 2 / 3); // 120 deg
	const green = sin_to_hex(sinI, 2 * Math.PI * 2 / 3); // 240 deg

	rainbow[i] = '#' + red + green + blue;
}

module.exports.run = async (client, member) => {
	if (colorСounter >= colorSize) colorСounter = 0;
	if (gifsСounter >= helloGifs.length) gifsСounter = 0;

	const channel = member.guild.channels.cache.find(ch => ch.id == '692796617656369292');

	const embed = new Discord.MessageEmbed()
		.setColor(rainbow[colorСounter++])
		.setTitle('Приветствие')
		.setDescription('')
		.setThumbnail('https://cdn.discordapp.com/attachments/402109825896415232/692820764478668850/yummylogo.jpg')
		.addField('Здраствуйте!', 'Добро пожаловать на официальный Discord сервер YummyAnime!')
		.addField('Внимание!', 'Перед тем, как начать своё увлекательное путешествие по нашему уютному серверу, пожалуйста, не поленитесь и прочтите правила, которые вы можете найти в закрепленных сообщениях данного канала.')
		.addField('Краткий гид:', `В разделе "мероприятия & ивенты" вы можете найти все актуальные, запланированные и прошедшие мероприятия, узнать о новостях мира аниме и ознакомиться с более полной версией правил.
		В разделе "чаты" вы можете общаться со своими единомышленниками на различные темы, вместе смеяться над мемами и другим развлекательным контентом.
		Раздел "зона отдыха" представлен несколькими голосовыми каналами, в которых вы можете общаться и слушать музыку.
		Для тех, кто любит игры, создан отдельный раздел "игровая", в котором вы найдете голосовые каналы с ограниченным числом вступающих, чтобы вас не отвлекали посторонние.
		Надеемся, что вы хорошо проведёте время!`)
		.setImage(helloGifs[gifsСounter++])
		.setTimestamp();

	channel.send(`${member}`);
	channel.send(embed);
};

module.exports.help = {
	name: 'greeting',
};

function sin_to_hex(i, phase) {
	const sin = Math.sin(Math.PI / colorSize * 2 * i + phase);
	const int = Math.floor(sin * 127) + 128;
	const hex = int.toString(16);

	return hex.length === 1 ? '0' + hex : hex;
}

function randomInteger(min, max) {
	const rand = min + Math.random() * (max + 1 - min);
	return Math.floor(rand);
}