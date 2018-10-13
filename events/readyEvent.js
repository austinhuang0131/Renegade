// const { PlayerManager } = require("eris-lavalink");
module.exports = (bot) => {
	bot.on("ready", async () => {
		console.log(`Ready! | ${bot.guilds.size} servers | ${bot.users.size} users`);
		/*	let nodes = [
				{ host: "localhost", port: 8080, region: "eu", password: "youshallnotpass" }
			];
	
			let regions = {
				eu: ["eu", "amsterdam", "frankfurt", "russia", "hongkong", "singapore", "sydney"],
				us: ["us", "brazil"],
			};
	
			 if (!(bot.voiceConnections instanceof PlayerManager)) {
				bot.voiceConnections = new PlayerManager(bot, nodes, {
					numShards: 1,
					userId: bot.user.id,
					regions: regions,
					defaultRegion: 'eu',
				});
			}
			*/

		bot.editStatus("online", {
			name: "servers",
			type: 3
		});
	});

};