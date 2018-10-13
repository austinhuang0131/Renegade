module.exports = (bot) => {
	bot.on("guildMemberAdd", async (guild, member) => {
		let data = await bot.r.table("guildSettings").filter({ guildID: guild.id }).run();
		if (data[0] && data[0].autoRoles) {
			let autoRoles = data[0].autoRoles;
			autoRoles.forEach(roleID => member.addRole(roleID, "Autorole"));
		} if (data[0] && data[0].logs.joinleave) {
			let days = Math.floor((new Date() - member.user.createdAt) / 86400000);
			let string = `➤ **User ID:** ${member.user.id}\n➤ **Account Age:** ${days} ${days > 1 && days != 0 ? "days" : "day"}`;
			let embed = {
				author: {
					name: `${member.user.tag}\nA member has joined`,
					icon_url: member.user.avatarURL
				},
				color: bot.config.colors.log.join,
				fields: [
					{
						name: "A member has joined",
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