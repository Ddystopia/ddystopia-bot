const Discord = module.require('discord.js');
// const fs = require('fs');
// const client = new Discord.Client();

let i = 0;

module.exports.run = async (client, message, args) => {
	if (
		!message.member.roles.cache.has('691736168693497877') && //Модератор
		!message.member.roles.cache.has('606932311606296624') && //Администратор
		!message.member.roles.cache.has('657964826852589609') //Главный администратор
	) return;
	if (!args[0]) return message.reply('Вы не указaли роль');
	if (message.guild.members.cache.filter(m => !m.user.bot).size <= i) i = 0;

	const nameFromArgs = args[0];

	args[1] = 'basic';//==============================================

	const isBasic = args[1] === 'basic' ? true : false;
	const delIfAnother = args[2] === 'delIfAnother' ? true : false;
	const role = message.guild.roles.cache.find(r => r.name === nameFromArgs);
	if (!role) return message.reply(`Role ${nameFromArgs} is not found`)

	if (!isBasic)
		message.guild.members.cache
		.filter(m => !m.user.bot && !m.roles.cache.find(r => r.name === nameFromArgs))
		.forEach(async member => {
			member.roles.add(role)
			i++
		})
	else if (delIfAnother)
		message.guild.members.cache.filter(m => !m.user.bot).forEach(async member => {
			if (member.roles.cache.size < 2) member.roles.add(role);
			if (member.roles.cache.size > 2 && member.roles.cache.find(r => r.name === nameFromArgs)) member.roles.remove(role);
			i++
		})
	else
		message.guild.members.cache.filter(m => !m.user.bot && m.roles.cache.size < 2).forEach(async member => {
			member.roles.add(role);
			i++
		})

	console.log(i);
	console.log(new Date());
	message.reply(`${i} людям была выдана роль Яммик`)
	return i;
};

module.exports.help = {
	name: 'setroleeveryone',
};