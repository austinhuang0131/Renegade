module.exports = {
	commands: [
		"serverinfo"
	],
	description: "Get information about the server",
	example: "serverinfo",
	clientPerms: ["embedLinks"],
	execute: async (bot, msg) => {
		let guild = msg.guild;
		let owner = guild.members.get(guild.ownerID);
		let emojis = [];
		guild.emojis.forEach(e => {
			if (e.animated) emojis.push(`<a:${e.name}:${e.id}>`);
			else emojis.push(`<:${e.name}:${e.id}>`);
		});
		let botCount = guild.members.filter(m => m.user.bot).length;
		let description = `➤ **ID:** ${guild.id}\n➤ **Owner:** ${owner.tag}\n➤ **Region:** ${guild.region}\n➤ **Members(${guild.memberCount}):** 🤖 ${botCount} | 👤 ${guild.memberCount - botCount}`;
		if (guild.roles.size >= 1) description += `\n➤ **Roles(${guild.roles.size}):** ${guild.roles.map(r => r.name).join(", ")}`;
		if (guild.emojis.length >= 1) description += `\n➤ **Emojis(${guild.emojis.length}):** ${emojis.join(" ")}`;
		let embed = {
			color: bot.config.colors.embedColor,
			description: description,
			author: {
				name: msg.guild.name
			},
			thumbnail: {
				url: msg.guild.iconURL
			}
		};
		msg.channel.createMessage({ embed: embed });
	}
};