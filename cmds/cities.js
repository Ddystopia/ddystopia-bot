const Discord = module.require("discord.js");
let words = [];

module.exports.run = async (client, message, propArgs) => {
	if (message.author.bot) return;
	const args = propArgs || message.content.split(/\s+/g);
	const word = args[0] && args[0].toLowerCase().trim();
	switch (word) {
		case "clear":
			words = [];
			message.react("✅");
			break;
		default:
			if (!word) return;
			const correct =
				!words.length || word[0] === words.slice().pop().split("").pop();
			//if first symbol of current word !== last symbol of prev word is false
			if (words.includes(word) || !correct || args[1] || word.length < 2)
				message.react("❌");
			else {
				words.push(word);
				message.react("✅");
			}
			break;
	}
};

module.exports.help = {
	name: "cities",
};
