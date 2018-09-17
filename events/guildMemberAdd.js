module.exports = (bot) => {
    bot.on("guildMemberAdd", async (guild, member) => {
        let data = await bot.r.table("welcome").filter({
            guildId: guild.id
        }).run();
        if (data[0]) {
            let content = data[0].content.replace("{USER.TAG}", member.user.tag).replace("{USER.NAME}", member.user.username).replace("{USER.MENTION}", member.user.toString()).replace("{USER.POS}", ordinal(guild.members.size)).replace("{SERVER.NAME}", guild.name);
            if (data[0].embed) {
                let hex;
                hex = data[0].hex;
                if (data[0].hex === 'random') hex = 'RANDOM';
                let embed = {
                    embed: {
                        color: hex,
                        description: content
                    }
                };
                if (data[0].dm) {
                    bot.getDMChannel(member.user).createMessage(embed);
                } else {
                    if (bot.getChannel(`${data[0].channelId}`)) bot.getChannel(`${data[0].channelId}`).createMessage(embed);
                }
            } else {
                if (row[0].dm) {
                    member.send(content);
                } else {
                    if (bot.getChannel(`${data[0].channelId}`)) bot.getChannel(`${data[0].channelId}`).createMessage(embed);
                }
            }
        }
        let dataTwo = await bot.r.table("logs").filter({
            guildId: guild.id
        }).run();
        if (dataTwo[0]) {
            if (bot.getChannel(`${data[0].channelId}`)) {
                let embed = {
                    embed: {
                        color: bot.config.colors.green,
                        author: {
                            name: member.user.tag,
                            icon_url: member.user.avatarURL
                        },
                        footer: "Member Joined!",
                        timestamp: new Date()
                    }
                };
                bot.getChannel(`${data[0].channelId}`).createMessage(embed);
            }
        }
        bot.r.table("autoroles").filter({
            guildId: guild.id
        }).run().then(row => {
            if (!row[0]) return;
            let theRoles = row[0].role;
            if (theRoles.length < 1) return;
            theRoles.forEach(r => {
                if (!guild.roles.get(r)) return;
                member.addRole(`${r}`);
            });
        });
    });
}