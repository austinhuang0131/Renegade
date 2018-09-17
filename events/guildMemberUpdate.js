module.exports = (bot) => {
    bot.on("guildMemberUpdate", async (guild, nmember, omember) => {
        if (omember.nickname === nmember.nickname) return;
        let data = await bot.r.db("modbot_db").table("logs").filter({
            guildId: guild.id
        }).run();
        if (!data[0]) return;
        if (bot.getChannel(data[0].channelId)) {
            let embed = {
                embed: {
                    color: bot.config.colors.orange,
                    author: {
                        name: nmember.user.tag,
                        icon_url: nmember.user.avatarURL
                    },
                    fields: [{
                            name: "Old Nickname",
                            value: omember.nickname
                        },
                        {
                            name: "New Nickname",
                            value: nmember.nickname
                        }
                    ],
                    footer: "Nickname Changed",
                    timestamp: new Date()
                }
            };
            bot.getChannel(data[0].channelId).createMessage(embed);
        }
    });
}