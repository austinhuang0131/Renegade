module.exports = (bot) => {
    bot.on("guildMemberRemove", async(guild, member) => {
        let data = await bot.r.table("logs").filter({
            guildId: guild.id
        }).run();
        if (!data[0]) return;
        let embed = {
            embed: {
                color: bot.config.colors.red,
                author: {
                    name: member.user.tag,
                    icon_url: member.user.avatarURL
                },
                footer: "Member left..",
                timestamp: new Date()
            }
        };
        if (bot.getChannel(`${data[0].channelId}`)) bot.getChannel(`${data[0].channelId}`).createMessage(embed);
    });
}