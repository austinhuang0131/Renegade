module.exports = {
	commands: [
		"kick"
	],
	description: "Remove a user from the guild",
	example: "kick @aTmG being rude",
	args: [
		{
			name: "user",
			description: "The user to be kicked"
		},
		{
			name: "reason",
			description: "Why?",
			optional: true
		}
	],
	clientPerms: ["kickMembers"],
	userPerms: ["kickMembers"],
	execute: async (bot, msg, args) => {
		let toBeKicked = bot.utils.findMember(msg.guild, args[0]);
		if (!toBeKicked) return msg.channel.createMessage(`${bot.config.emojis.x} I could not find that user.`);
		if (!toBeKicked.kickable) return msg.channel.createMessage(`${bot.config.emojis.x} I do not have permission to kick that user.`);
		if (!toBeKicked.punishable(msg.member)) return msg.channel.createMessage(`${bot.config.emojis.x} You do not have permission to kick that user.`);
		let reason = args.slice(1).join(" ");
		try {
			await toBeKicked.kick(reason);
			let string = `${bot.config.emojis.check} Kicked \`${toBeKicked.user.username}\``;
			if (reason) string += ` with reason \`${reason}\``;
			msg.channel.createMessage(string);
			let data = await bot.r.table("guildSettings").filter({ guildID: msg.guild.id }).run();
			if (data[0] && data[0].logs && data[0].logs["mod"]) await bot.utils.modLog(msg.guild, msg.author, toBeKicked.user, "Kick", reason);
		} catch (e) {
			msg.channel.createMessage(`${bot.config.emojis.x} An error occured which caused me not to be able to do that.`);
			console.error(e);
		}
	}
};