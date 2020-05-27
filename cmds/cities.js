const Discord = module.require("discord.js");
let words = [];

module.exports.run = async (client, message, propArgs) => {
	if (message.author.bot) return;
	const args = propArgs || message.content.split(/\s+/g);
	if (args.length !== 1) return;
	const word = toFormat(args[0]);
	switch (word) {
		case "clear":
			words = [];
			message.react("✅");
			break;
		default:
			if (!word) return;
			if (isCorrect(word, words)) {
				words.push(word);
				message.react("✅");
			} else {
				message.react("❌");
				message.delete({ timeout: 3000 });
			}
			break;
	}
};

function toFormat(word) {
	if (!word) return null;
	word = word.toLowerCase().replace(/[ьъы]$/g, "");
	return word;
}

function isCorrect(word, words) {
	const correctLastSymbol =
		!words.length || word[0] === words[words.length - 1].split("").pop();
	const simpleLanguage = /^[a-z]+$/.test(word) || /^[а-я]+$/.test(word);
	return (
		!words.includes(word) &&
		correctLastSymbol &&
		word.length > 1 &&
		simpleLanguage
	);
}

module.exports.help = {
	name: "cities",
};
