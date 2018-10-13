module.exports = {
	commands: [
		"ban"
	],
	description: "Remove a user from a guild.. for good.",
	example: "ban @aTmG bad boy",
	args: [
		{
			name: "user",
			description: "The user to be banned"
		},
		{
			name: "reason",
			description: "Why?",
			optional: true
		}
	],
	clientPerms: ["banMembers"],
	userPerms: ["banMembers"],
	execute: async (bot, msg, args) => {
		let toBeBanned = bot.utils.findMember(msg.guild, args[0]);

		if (toBeBanned) {
			if (!toBeBanned.bannable) return msg.channel.createMessage(`${bot.config.emojis.x} I do not have permission to ban that user.`);
			if (!toBeBanned.punishable(msg.member)) return msg.channel.createMessage(`${bot.config.emojis.x} You do not have permission to ban that user.`);
		} else {
			if (isNaN(args[0])) return msg.channel.createMessage(`${bot.config.emojis.x} A user ID (a long number) must be supplied when banning someone not in the server.`);
			if (parseInt(args[0]) > 9223372036854775807) return msg.channel.createMessage(`${bot.config.emojis.x} The user ID supplied must be less than or equal to 9223372036854775807.`);
			toBeBanned = args[0];
		}
		let bans = await msg.guild.getBans();
		let isBanned = false;
		bans.forEach(ban => {
			if (ban.user.id == (toBeBanned.user ? toBeBanned.user.id : toBeBanned)) isBanned = true;
		});
		if (isBanned) return msg.channel.createMessage(`${bot.config.emojis.x} That user is already banned.`);
		let reason = args.slice(1).join(" ");
		try {
			await msg.guild.banMember(toBeBanned.user ? toBeBanned.user.id : toBeBanned, 7, reason);
			let ban = await msg.guild.getBan(toBeBanned.user ? toBeBanned.user.id : toBeBanned);
			let banned = ban.user;
			let string = `${bot.config.emojis.check} Banned \`${banned.username}\``;
			if (reason) string += ` with reason \`${reason}\``;
			msg.channel.createMessage(string);
			let data = await bot.r.table("guildSettings").filter({ guildID: msg.guild.id }).run();
			if (data[0] && data[0].logs && data[0].logs["mod"]) await bot.utils.modLog(msg.guild, msg.author, banned, "Ban", reason);
		} catch (e) {
			if (e.message.toLowerCase().includes("unknown user")) return msg.channel.createMessage(`${bot.config.emojis.x} You must provide a valid user ID when banning someone not in the server.`);
			msg.channel.createMessage(`${bot.config.emojis.x} An error occured which caused me not to be able to do that.`);
			console.error(e);
		}
	}
};