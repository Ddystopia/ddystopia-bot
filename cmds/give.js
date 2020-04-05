const Discord = module.require('discord.js');
const fs = require('fs');
// const client = new Discord.Client();


module.exports.run = async (client, message, args) => {
	if(message.channel.id !== '693487254911582259') return;
	if (!args) return;
	if (isNaN(+args[0])) return;
	if (+args[0] <= 0 || +args[0] > 1e+4) return;
	if (!args[1]) return;
	if (!args[1].match(/(\d{15,})/)) return;

	const fromId = message.author.id;
	const tillId = message.mentions.users.first().id;
	if (!tillId) return;
	try {
		const profileFrom = require(__dirname.replace(/cmds$/, '') + `profiles/${fromId}.json`);
		const profileTill = require(__dirname.replace(/cmds$/, '') + `profiles/${tillId}.json`);
		
		const transaction = args[0] == 'all' ? profileFrom.coins : +args[0];

		if (profileFrom.coins < transaction) return message.reply('Не хватает монет');

		profileFrom.coins -= transaction;
		profileTill.coins += transaction;

		fs.writeFile(__dirname.replace(/cmds$/, '') + `profiles/${fromId}.json`, JSON.stringify(profileFrom), err => err ? console.log(err) : null);
		fs.writeFile(__dirname.replace(/cmds$/, '') + `profiles/${tillId}.json`, JSON.stringify(profileTill), err => err ? console.log(err) : null);
		fs.appendFile(__dirname.replace(/cmds$/, '') + `transactionLogs.log`, `GIVE from${message.author.username} till ${message.mentions.users.first().username} - ${transaction} coins\n`, err => err ? console.log(err) : null);

		message.reply(`Было успешно переведено ${transaction} монет`)
	} catch (err) {
		message.reply('Я не знаю кому давать, пускай он использует любую комманду, чтобы я могла создать профиль')
	};
};

module.exports.help = {
	name: 'give',
};
