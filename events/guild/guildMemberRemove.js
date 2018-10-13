module.exports = (bot) => {
	bot.on("guildMemberRemove", async (guild, member) => {
		let data = await bot.r.table("guildSettings").filter({ guildID: guild.id }).run();
		let roles = member.roles.length >= 1 ? member.roleObjects.map(r => `**${r.name}**`).join(", ") : false;
		let joinedAt = member.joinedAt ? new Date(member.joinedAt).toString().substr(0, 15) : "Unknown";
		if (data[0] && data[0].logs.joinleave) {
			let string = `➤ **User ID:** ${member.user.id}\n➤ **Joined At:** ${joinedAt}`;
			if (roles) string += `\n➤ Roles: ${roles}`;
			let embed = {
				author: {
					name: `${member.user.tag}`,
					icon_url: member.user.avatarURL
				},
				color: bot.config.colors.log.leave,
				fields: [
					{
						name: "A member has left",
						value: string
					}
				],
				timestamp: new Date()
			};
			let channels = data[0].logs["joinleave"];
			channels.forEach(id => guild.channels.get(id).createMessage({ embed: embed }));
		}
	});
};