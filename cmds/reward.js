const Discord = module.require('discord.js');
const fs = require('fs');
// const client = new Discord.Client();


module.exports.run = async (client, message, args) => {
	if (
		!message.member.roles.cache.has('691736168693497877') && //Модератор
		!message.member.roles.cache.has('606932311606296624') && //Администратор
		!message.member.roles.cache.has('657964826852589609') //Главный администратор
	) return;
	if (!args) return;
	if (isNaN(+args[0]) && args[0] !== '-all') return;
	if (!args[1]) return;

	const tillId = args[1].match(/(\d{15,})/)[1];
	if (!tillId) return;
	try {
		const profileTill = require(__dirname.replace(/cmds$/, '') + `profiles/${tillId}.json`);

		const transaction = args[0] === '-all' ? -profileTill.coins : +args[0];

		profileTill.coins += transaction;

		fs.writeFile(__dirname.replace(/cmds$/, '') + `profiles/${tillId}.json`, JSON.stringify(profileTill), err => err ? console.log(err) : null);

		message.reply(`Было успешно переведено ${transaction} монет`)
	} catch (err) {
		console.error(new Error('Я не знаю кому давать, пускай он использует любую комманду, чтобы я могла создать профиль'))
	};
};

module.exports.help = {
	name: 'reward',
};