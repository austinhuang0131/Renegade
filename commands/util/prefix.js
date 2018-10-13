module.exports = {
	commands: [
		"prefix",
		"setprefix"
	],
	description: "Set the prefix for the current server",
	args: [
		{
			name: "prefix",
			description: "The new prefix for the server",
			optional: true
		}
	],
	userPerms: ["manageGuild"],
	execute: async (bot, msg, args) => {
		let prefix = args[0];
		let currentPrefix = await bot.utils.getPrefix(msg.guild);
		if (!prefix) return msg.channel.createMessage(`This server's prefix is: ${currentPrefix}`);
		if (currentPrefix == prefix) return msg.channel.createMessage(`${bot.config.emojis.x} That is already this server's prefix.`);
		let data = await bot.r.table("guildSettings").filter({ guildID: msg.guild.id }).run();
		if (!data[0]) await bot.r.table("guildSettings").insert({ guildID: msg.guild.id, prefix: prefix }).run();
		else await bot.r.table("guildSettings").filter({ guildID: msg.guild.id }).update({ prefix: prefix }).run();
		msg.channel.createMessage(`${bot.config.emojis.check} This server's prefix is now: ${prefix}`);
	}
};