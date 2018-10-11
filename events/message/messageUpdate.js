module.exports = (bot) => {
    bot.on("messageUpdate", async (newMsg, oldMsg) => {
        if (!oldMsg) return;
        let data = await bot.r.table("guildSettings").filter({ guildID: newMsg.guild.id }).run();
        if (data[0] && data[0].logs && data[0].logs["message"]) {
            let author = newMsg.author;
            if (author.bot) return;
            if (newMsg.content == oldMsg.content) return;
            let string = `➤ **Message ID:** ${newMsg.id}\n➤ **Channel:** ${newMsg.channel.mention}(${newMsg.channel.id})\n➤ **Old Content:** ${oldMsg.content}\n➤ **New Content:** ${newMsg.content}`;
            let embed = {
                color: bot.config.colors.log.msgEdit,
                author: {
                    name: newMsg.author.tag,
                    icon_url: newMsg.author.avatarURL
                },
                fields: [
                    {
                        name: "Message edited",
                        value: string
                    }
                ],
                timestamp: new Date()
            };
            data[0].logs["message"].forEach(id => newMsg.guild.channels.get(id).createMessage({ embed: embed }));
        }
    });
}