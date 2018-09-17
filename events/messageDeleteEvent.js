module.exports = (bot) => {
    bot.on("messageDelete", async(msg) => {
        let message = bot.getMessage(msg.channel.id, msg.id); // other values are not guaranteed (due to cache), so I cache the message first.
        if(message.author.bot) return;
        let data = await bot.r.db("modbot_db").table("logs").filter({
            guildId: message.guild.id
        }).run();
        if (!data[0]) return;
        if (bot.getChannel(`${data[0].channelId}`)) bot.getChannel(`${data[0].channelId}`).createMessage({
            embed: {
                author: {
                    name: message.author.tag,
                    icon_url: mafter.author.avatarURL
                },
                fields: [{
                        name: "Channel",
                        value: `#${message.channel.name}`
                    },
                    {
                        name: "Message",
                        value: message.content
                    }
                ],
                footer: {
                    text: "Message Deleted"
                },
                color: bot.config.colors.red,
                timestamp: new Date()
            }
        });
    });
}