const Discord = module.require('discord.js');
const ytdl = require("ytdl-core");

const queue = new Map();


module.exports.run = async (client, message, args, cmd) => {
	let serverQueue = queue.get(message.guild.id) || null;
	if (cmd === 'summon')
		summon(message, serverQueue);
	else if (cmd === 'play')
		execute(message, args, serverQueue);
	else if (cmd === 'skip')
		skip(message, serverQueue);
	else if (cmd === 'leave')
		stop(message, serverQueue);
	else if (cmd === 'q')
		q(message, serverQueue);
	else
		message.channel.send("You need to enter a valid command!");
};

function q(message, serverQueue) {
	if (!serverQueue) return
	let i = 0;
	const embed = new Discord.MessageEmbed()
		.setColor('#03fc13')
		.setTimestamp();
	do {
		embed.addField(i || `${i} (current)`, serverQueue.songs[i] ? serverQueue.songs[i].title : 'Empty');
		i++
	}
	while (i < Math.min(serverQueue.songs.length, 15))
	message.reply(embed)
}

async function summon(message, serverQueue) {
	if (serverQueue) return
	if (message.member.voice.channel) {
		const connection = await message.member.voice.channel.join()
		queue.set(message.guild.id, {
			textChannel: message.channel,
			voiceChannel: message.member.voice.channel,
			connection: connection,
			songs: [],
			volume: 5,
			playing: true,
			summoned: true,
		})
	} else {
		message.reply('You need to join a voice channel first!');
	}
}

async function execute(message, args, serverQueue) {
	if (!serverQueue) return;
	const voiceChannel = serverQueue.voiceChannel
	if (voiceChannel !== message.member.voice.channel)
		return message.channel.send(
			"You need to be in the same whith bot voice channel to play music!"
		);
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has("CONNECT") || !permissions.has("SPEAK"))
		return message.channel.send(
			"I need the permissions to join and speak in your voice channel!"
		);
		let songInfo;
	try {
		songInfo = await ytdl.getInfo(args[0]);
	}catch(err){
		return message.reply(`${err}`)
	}
		const song = {
			title: songInfo.title,
			url: songInfo.video_url
		}

	if (!serverQueue.songs[0]) {
		serverQueue.songs.push(song);
		try {
			play(message.guild, serverQueue.songs[0], serverQueue);
		} catch (err) {
			console.error(err);
			return message.channel.send(err);
		}
	} else {
		serverQueue.songs.push(song);
		return message.channel.send(new Discord.MessageEmbed().addField('New song', `${song.title} has been added to the queue!`));
	}
}

function skip(message, serverQueue) {
	if (!serverQueue) return;
	if (!serverQueue.songs[0]) return;
	if (!message.member.voice.channel === serverQueue.voiceChannel)
		return message.channel.send(
			"You have to be in the same as bot voice channel to stop the music!"
		);
	serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
	if (!serverQueue) return;
	if (!message.member.voice.channel)
		return message.channel.send(
			"You have to be in a voice channel to stop the music!"
		);
	serverQueue.voiceChannel.leave();
	serverQueue = null;
	queue.delete(message.guild.id)
}

function play(guild, song, serverQueue) {
	if (!song) return
	const dispatcher = serverQueue.connection
		.play(ytdl(song.url))
		.on("finish", () => {
			serverQueue.songs.shift();
			if (serverQueue.songs.length > 0) play(guild, serverQueue.songs[0], serverQueue)
		})
		.on("error", error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
	serverQueue.voiceChannel.dispatcher = dispatcher;
	serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}


module.exports.help = {
	name: 'music',
};