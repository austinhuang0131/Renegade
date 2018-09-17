module.exports = (bot) => {
    bot.on('messageUpdate', async (mbefore, mafter) => {
        if (mbefore.author.bot) return;
        if (mbefore.content === mafter.content) return;
        if (await Utils.triggeredMaxMentions(mafter)) {
            if (mafter.member.permissions.has("ADMINISTRATOR") || await hasPerm(mafter, "maxmentions.bypass")) return;
            if (!mafter.guild.me.permissions.has("MANAGE_MESSAGES")) return;
            mafter.delete();
            mafter.reply(`You sent too many unique mentions!`);
        }
        let data = await bot.r.db("modbot_db").table("logs").filter({
            guildId: mafter.guild.id
        }).run();
        if (!data[0]) return;
        if (bot.getChannel(`${data[0].channelId}`)) bot.getChannel(`${data[0].channelId}`).createMessage({
            embed: {
                author: {
                    name: mafter.author.tag,
                    icon_url: mafter.author.avatarURL
                },
                fields: [{
                        name: "Channel",
                        value: `#${mafter.channel.name}`
                    },
                    {
                        name: "Old message",
                        value: mbefore.content
                    },
                    {
                        name: "New Message",
                        value: mafter.content
                    }
                ],
                footer: {
                    text: "Message edit"
                },
                color: bot.config.colors.orange,
                timestamp: new Date()
            }
        });

    });
}