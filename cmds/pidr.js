const Discord = module.require('discord.js');
// const fs = require('fs');
// const client = new Discord.Client();

module.exports.run = async (client, message, args) => {
	if (!args[0] || /.+?(691999029457977385|630767319257317378)/.test(args[0])) return message.reply('Вы не указaли человека');
	message.channel.send(args[0] + ' ты пидр');
	message.delete();
};

module.exports.help = {
	name: 'pidr',
};