const Discord = module.require('discord.js');
const fs = require('fs');
const randomInteger = require('../utils/randomInteger.js')
// const client = new Discord.Client();


module.exports.run = async (client, message, args) => {
	if (message.channel.id !== '693487254911582259') return;
	let profile;
	try {
		profile = require(__dirname.replace(/cmds$/, '') + `profiles/${message.author.id}.json`);
	} catch (err) {
		profile = {
			coins: 0,
			resentDaily: Date.now() - 1000 * 60 * 60 * (24 + 1),
		}
	}
	if ((Date.now() - profile.resentDaily) < 1000 * 60 * 60 * 12)
		return message.reply(`Вы уже получили свою долю, следующий раз получить можно через ${formatDuration(60 * 60 * 12  - (Date.now() - profile.resentDaily)/1000)}`);
	const betNum = randomInteger(-30, 20) + 30;
	const realNum = randomInteger(0, 50);
	const sum = betNum == realNum ? 1000 * 10 : 1000;
	profile.coins += sum;
	profile.resentDaily = Date.now();

	fs.writeFile(__dirname.replace(/cmds$/, '') + `profiles/${message.author.id}.json`, JSON.stringify(profile), err => err ? console.log(err) : null);
	message.reply(`Вы получили ${sum} монет, следующий раз получить можно через 12 часов`);
};

module.exports.help = {
	name: 'daily',
};

function formatDuration(seconds) {
	let time = {
			year: 31536000,
			day: 86400,
			hour: 3600,
			minute: 60,
			second: 1
		},
		res = [];

	if (seconds === 0) return 'now';

	for (let key in time) {
		if (seconds >= time[key]) {
			let val = Math.floor(seconds / time[key]);
			res.push(val += val > 1 ? ' ' + key + 's' : ' ' + key);
			seconds = seconds % time[key];
		}
	}

	return res.length > 1 ? res.join(', ').replace(/,([^,]*)$/, ' and' + '$1') : res[0]
}