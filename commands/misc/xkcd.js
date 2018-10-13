const superagent = require("superagent");
module.exports = {
	commands: [
		"xkcd"
	],
	description: "Get a random comic from [xkcd](https://xkcd.com)",
	example: "xkcd",
	clientPerms: ["embedLinks"],
	execute: async (bot, msg) => {
		try {
			const latest = await superagent.get("https://xkcd.com/info.0.json");
			const random = await superagent.get(`https://xkcd.com/${Math.floor(Math.random() * latest.body.num + 1)}/info.0.json`);
			msg.channel.createMessage({
				embed: {
					description: random.body.alt,
					color: bot.config.colors.embedColor,
					author: {
						name: `XKCD #${random.body.num} - ${random.body.title}`,
						url: random.body.link
					},
					image: {
						url: random.body.img
					},
					footer: {
						text: "Powered by XKCD"
					},
					timestamp: new Date()
				}
			});
		} catch (e) {
			msg.channel.createMessage(`${bot.config.emojis.x} An error occured when trying to fetch an XKCD comic.`);
			console.error(e);
		}
	}
};