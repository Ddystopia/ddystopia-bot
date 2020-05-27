const Discord = module.require("discord.js");
let words = [];

module.exports.run = async (client, message, propArgs) => {
	if (message.author.bot) return;
	const args = propArgs || message.content.split(/\s+/g);
	if(args.length !== 1) return;
	const word = toFormat(args[0]);
	switch (word) {
		case "clear":
			words = [];
			message.react("✅");
			break;
		default:
			if (!word) return;
			const correct =
				!words.length || word[0] === words[words.length - 1].split("").pop();
			//if first symbol of current word !== last symbol of prev word is false
			if (words.includes(word) || !correct || word.length < 2) {
				message.react("❌");
				message.delete({timeout: 3000});
			} else {
				words.push(word);
				message.react("✅");
			}
			break;
	}
};

function toFormat(word) {
	if (!word) return null;
	word = word.toLowerCase().replace(/[ьъы]$/g, "");
	return word;
}

module.exports.help = {
	name: "cities",
};
