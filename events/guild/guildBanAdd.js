module.exports = (bot) => {
	bot.on("guildBanRemove", async (guild, user) => {
		let data = await bot.r.table("guildSettings").filter({ guildID: guild.id }).run();
		let botmember = guild.members.get(bot.user.id);
		if (data[0] && data[0].logs && data[0].logs["mod"] && botmember.permission.has("viewAuditLogs")) {
			setTimeout(async () => {
				let audit = await guild.getAuditLogs(1, undefined, 22);
				let moderator = audit.entries[0].user;
				if (moderator.id == bot.user.id) return;
				let reason = audit.entries[0].reason;
				await bot.utils.modLog(guild, moderator, user, "Ban", reason);
			}, 1000);
		}
	});
};