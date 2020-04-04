const Discord = module.require('discord.js');
const fs = require('fs');

module.exports.run = async (client, message) => {
	const attachmentsNum = message.attachments.size;
	if (!attachmentsNum) return;
	let profile;
	try {
		profile = require(__dirname.replace(/cmds$/, '') + `profiles/${message.author.id}.json`);
	} catch (err) {
		profile = {
			coins: 0,
			resentDaily: Date.now() - 1000 * 60 * 60 * (24 + 1),
		}
	}
	profile.coins += attachmentsNum * 180;
	fs.writeFile(__dirname.replace(/cmds$/, '') + `profiles/${message.author.id}.json`, JSON.stringify(profile), err => err ? console.log(err) : null);
};

module.exports.help = {
	name: 'increaseMoneyForImage',
};