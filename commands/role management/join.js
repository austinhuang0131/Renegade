module.exports = {
	commands: [
		"join",
		"joinRole"
	],
	description: "Add a public role to yourself",
	example: "join Red",
	args: [
		{
			name: "role",
			description: "The role you want"
		}
	],
	clientPerms: ["manageRoles"],
	execute: async (bot, msg, args) => {
		let role = bot.utils.findRole(msg.guild, args[0]);
		if (!role) return msg.channel.createMessage(`${bot.config.emojis.x} I could not find that role`);
		let data = await bot.r.table("guildSettings").filter({
			guildID: msg.guild.id
		}).run();
		if (!data[0] || !data[0].publicRoles) return msg.channel.createMessage(`${bot.config.emojis.x} There are no public roles here`);
		if (!data[0].publicRoles.includes(role.id)) return msg.channel.createMessage(`${bot.config.emojis.x} That role is not a public role.`);
		if (msg.member.roles.includes(role.id)) return msg.channel.createMessage(`${bot.config.emojis.x} You already have this role.`);
		try {
			await msg.member.addRole(role.id, "User wanted to join the public role");
			msg.channel.createMessage(`${bot.config.emojis.check} You now have the \`${role.name}\` role.`);
		} catch (e) {
			msg.channel.createMessage(`${bot.config.emojis.x} An unexpected error has occured.`);
			console.error(e);
		}
	}
};