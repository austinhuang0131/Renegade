const superagent = require("superagent");
module.exports = {
	commands: [
		"catfact"
	],
	description: "Get a random cat fact",
	execute:  (bot, msg) => {
		superagent.get("https://catfact.ninja/fact")
			.end((err, res) => {
				let body = res.body;
				if(!err || body.status === 200){
					msg.channel.createMessage(body.fact);
				} else {
					msg.channel.createMessage(`${bot.config.emojis.x} An error occured.`);
					console.error(err);
				}
			});
	}
};