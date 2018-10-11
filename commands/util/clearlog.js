module.exports = {
    commands: [
        "clearlog"
    ],
    description: "Set a channel as a log",
    example: "setlog mod #mod-log",
    args: [
        {
            name: "log",
            description: "The type of log `(mod)`"
        },
        {
            name: "channel",
            description: "The channel you want to set as a log"
        }
    ],
    clientPerms: ["embedLinks"],
    userPerms: ["manageChannels"],
    execute: async (bot, msg, args) => {
        let log = args[0].toLowerCase();
        if (!bot.config.validLogs.includes(log) && log != "all") return msg.channel.createMessage(`${bot.config.emojis.x} Valid log types: \`${bot.config.validLogs.join(", ")}\``);
        let channel = bot.utils.findChannel(msg.guild, args[1]);
        if (!channel) return msg.channel.createMessage(`${bot.config.emojis.x} I could not find that channel`);
        let data = await bot.r.table("guildSettings").filter({ guildID: msg.guild.id }).run();
        if (!data[0] || !data[0].logs || !data[0].logs[log]) return msg.channel.createMessage(`${bot.config.emojis.x} There are no logs of that type.`);
        let logObj = data[0].logs;
        if (!logObj[log].includes(channel.id)) return msg.channel.createMessage(`${bot.config.emojis.x} That channel is not a log of the type \`${log}\``);
        logObj[log] = logObj[log].filter(id => id != channel.id);
        if (logObj[log].length < 1) {
            delete data[0].logs[log];
            if (Object.keys(data[0].logs) < 1) delete data[0].logs;
            if (Object.keys(data[0]).length - 1 == 1) await bot.r.table("guildSettings").filter({ guildID: msg.guild.id }).delete().run();
            else if (!data[0].logs) await bot.r.table("guildSettings").filter({ guildID: msg.guild.id }).replace(bot.r.row.without("logs")).run();
            else await bot.r.table("guildSettings").filter({ guildID: msg.guild.id }).update({ logs: data[0].logs }).run();
        }
        else await bot.r.table("guildSettings").filter({ guildID: msg.guild.id }).update({ logs: logObj }).run();
        msg.channel.createMessage(`${bot.config.emojis.check} ${channel.mention} is no longer a log of the type \`${log}\``);
    }
}
