module.exports = (bot) => {
    bot.on("messageDelete", async (msg) => {
        if (!msg.content) return;
        let data = await bot.r.table("guildSettings").filter({ guildID: msg.guild.id }).run();
        if (data[0] && data[0].logs && data[0].logs["message"]) {
            let author = msg.author;
            if (author.bot) return;
            let string = `➤ **Message ID:** ${msg.id}\n➤ **Channel:** ${msg.channel.mention}(${msg.channel.id})\n➤ **Content:** ${msg.content}`;
            let embed = {
                color: bot.config.colors.log.msgDelete,
                author: {
                    name: msg.author.tag,
                    icon_url: msg.author.avatarURL
                },
                fields: [
                    {
                        name: "Message deleted",
                        value: string
                    }
                ],
                timestamp: new Date()
            };
            data[0].logs["message"].forEach(id => msg.guild.channels.get(id).createMessage({ embed: embed }));
        }
    });
}