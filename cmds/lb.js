const Discord = module.require('discord.js');
const fs = require('fs');
let lb = [];
let profiles = [];

module.exports.run = async (client, message, args) => {
	const embed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Leader board')
		.setThumbnail('https://cdn.discordapp.com/attachments/402109825896415232/692820764478668850/yummylogo.jpg')
		.setTimestamp();
	fs.readdir(__dirname.replace(/cmds$/, '') + `profiles/`, (err, files) => {
		if (err) throw new Error(err);
		const jsonFiles = files.filter(f => f.split('.').pop() === 'json');
		if (jsonFiles.length <= 0) throw new Error('No files to download');
		jsonFiles.forEach((f, i) => {
			profiles.push([f.replace('.json', ''), require(`../profiles/${f}`)]);
		})
		profiles.sort((a, b) => +b[1].coins - +a[1].coins).forEach(item => lb.push([item[0], item[1].coins]));
		if (+args[0] < 2) args[0] = 1;
		if (+args[0] * 10 > lb.length) args[0] = Math.floor(lb.length / 10);
		if (isNaN(+args[0])) args[0] = 1;
		embed.setDescription(`Page number ${args[0]--}`);
		for (let i = 0, index = 0; i < 10; i++) {
			if(!lb[+`${args[0]}${i}`]) break;
			const member = message.guild.members.cache.get(lb[+`${args[0]}${i}`][0]);
			if (!member) continue;
			const username = member.user.username;
			embed.addField(++index, `${username} - ${lb[+`${args[0]}${i}`][1]}`)
		}
		lb = [];
		profiles = [];
		message.reply(embed)
	});
}
module.exports.help = {
	name: 'lb',
};