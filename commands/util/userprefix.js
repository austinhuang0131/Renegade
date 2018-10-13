module.exports = {
	commands: [
		"userprefix",
		"setuserprefix"
	],
	description: "Set a personal prefix for yourself",
	args: [
		{
			name: "prefix",
			description: "The new prefix",
			optional: true
		}
	],
	execute: async (bot, msg, args) => {
		let prefix = args[0];
		let currentPrefix = await bot.utils.getUserPrefix(msg.author);
		if (!prefix) {
			if (currentPrefix) return msg.channel.createMessage(`Your prefix is: ${currentPrefix}`);
			else return msg.channel.createMessage("You do not have a personal prefix");
		}
		if (currentPrefix == prefix) return msg.channel.createMessage(`${bot.config.emojis.x} That is already your prefix.`);
		let data = await bot.r.table("userprefixes").filter({ userID: msg.author.id }).run();
		if (!data[0]) await bot.r.table("userprefixes").insert({ userID: msg.author.id, prefix: prefix }).run();
		else await bot.r.table("userprefixes").filter({ userID: msg.author.id }).update({ prefix: prefix }).run();
		msg.channel.createMessage(`${bot.config.emojis.check} Your prefix is now: ${prefix}`);
	}
};