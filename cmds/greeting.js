const Discord = module.require('discord.js');
// const fs = require('fs');
// const client = new Discord.Client();

const colorSize = 60;
const rainbow = new Array(colorSize);
const helloGifs = [
	'https://i.ibb.co/jV0BDbB/orig-1.gif',
	'https://i.ibb.co/zh4SSww/giphy.gif',
	'https://i.ibb.co/b7c6xMT/ezgif-4-95469e1722e5.gif',
	'https://i.ibb.co/HBKRR9F/e4d09b2f8273494a10e003bee7951b82.gif',
	'https://i.ibb.co/jGyV708/e03d7b19e67292f6e95e71d6e46161464b1a6f2er1-560-533-hq.gif',
	'https://i.ibb.co/Smm1YRZ/da23ej0-286f5140-5b9e-4b90-bf9e-65e15e4c95fe.gif',
	'https://i.ibb.co/FmTxw6M/Anime-Kantai-Collection-Shimakaze-Anime-1375941.gif',
	'https://i.ibb.co/2d8CQjz/191685417001202.gif',
	'https://i.ibb.co/fvGXC1q/178892703000202.gif',
	'https://i.ibb.co/R6Kfs8R/209127.gif',
	'https://i.ibb.co/wQZQsVm/80cfc6f923d78b92b7672b010d5473c8b7e6b1a6-hq.gif',
	'https://i.ibb.co/JHz9fvq/9V6v.gif',
	'https://i.ibb.co/M9RkLf5/20c2c7bc21fbfa535f09356c954b03cf.gif',
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