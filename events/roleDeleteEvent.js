module.exports = (bot) => {
    bot.on("guildRoleDelete", async (guild, role) => {
        bot.r.table("autoroles").filter({
            guildId: guild.id
        }).run().then(row => {
            if (!row[0]) return;
            if (!row[0].role.includes(role.id)) return;
            bot.r.table("autoroles").filter({
                guildId: guild.id
            }).delete().run();
        });
        bot.r.table("publicroles").filter({
            guildId: guild.id
        }).run().then(row => {
            if (!row[0]) return;
            if (row[0].therole.includes(role.id)) return;
            if (row[0].therole.length < 1) {
                bot.r.table("publicroles").filter({
                    guildId: guild.id
                }).delete().run();
            }
            let newlist = row[0].therole.filter(r => r !== role.id);
            bot.r.table("publicroles").filter({
                guildId: guild.id
            }).update({
                therole: newlist
            });
        })
        let data = await bot.r.table("logs").filter({
            guildId: guild.id
        }).run();
        if (!data[0]) {
            return;
        } else {
            if (bot.getChannel(`${data[0].channelId}`)) bot.getChannel(`${data[0].channelId}`).createMessage({
                embed: {
                    author: {
                        name: "Role Deleted",
                    },
                    fields: [{
                        name: "Role Name",
                        value: `#${role.name}`
                    }],
                    color: bot.config.colors.red,
                    timestamp: new Date()
                }
            });
        }
    });
}