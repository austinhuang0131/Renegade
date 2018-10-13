module.exports = {
	commands: [
		"unban"
	],
	description: "Remove a user from the banlist",
	example: "unban @aTmG good boi",
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
		let toBeUnbanned = args[0]; //should be an ID
		if (isNaN(args[0])) return msg.channel.createMessage(`${bot.config.emojis.x} A user ID (a long number) must be supplied.`);
		let bans = await msg.guild.getBans();
		let isBanned = false;
		bans.forEach(ban => {
			if (ban.user.id == toBeUnbanned) isBanned = true;
		});
		if (!isBanned) return msg.channel.createMessage(`${bot.config.emojis.x} That user is not banned.`);
		let reason = args.slice(1).join(" ");
		try {
			let ban = await msg.guild.getBan(toBeUnbanned);
			let banned = ban.user;
			await msg.guild.unbanMember(toBeUnbanned, reason);
			let string = `${bot.config.emojis.check} unbanned \`${banned.username}\``;
			if (reason) string += ` with reason \`${reason}\``;
			msg.channel.createMessage(string);
			let data = await bot.r.table("guildSettings").filter({ guildID: msg.guild.id }).run();
			if (data[0] && data[0].logs && data[0].logs["mod"]) await bot.utils.modLog(msg.guild, msg.author, banned, "Unban", reason);
		} catch (e) {
			msg.channel.createMessage(`${bot.config.emojis.x} An error occured which caused me not to be able to do that.`);
			console.error(e);
		}
	}
};