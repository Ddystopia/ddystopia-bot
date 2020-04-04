const Discord = module.require('discord.js');
const fs = require('fs');
// const client = new Discord.Client();


module.exports.run = async (client, message, args) => {
	let userId;
	try {
		userId = args[0] ? args[0].match(/(\d{15,})/)[1] : message.author.id;
	}catch(err){
		return message.reply('I don\'t know who is it');
	}

	let profile;
	try {
		profile = require(__dirname.replace(/cmds$/, '') + `profiles/${userId}.json`);
	} catch (err) {
		profile = {
			coins: 0,
			resentDaily: Date.now() - 1000 * 60 * 60 * (24 + 1),
		}
	}
	const exampleEmbed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.addField('Расчёт', `На счету ${profile.coins} монет`);
	message.reply(exampleEmbed);
};

module.exports.help = {
	name: 'money',
};