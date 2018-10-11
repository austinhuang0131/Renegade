module.exports = {
    commands: [
        "setlog"
    ],
    description: "Set a channel as a log",
    example: "setlog mod #mod-log",
    args: [
        {
            name: "log",
            description: "The type of log"
        },
        {
            name: "channel",
            description: "The channel you want to set a log to"
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
        if (!data[0]) {
            let obj = { guildID: msg.guild.id, logs: {} };
            obj.logs[log] = [channel.id];
            await bot.r.table("guildSettings").insert(obj).run();
        } else {
            let logObj = data[0].logs;
            if (logObj) {
                if (logObj[log] && logObj[log].includes(channel.id)) return msg.channel.createMessage(`${bot.config.emojis.x} That channel is already a log of the type \`${log}\``);
                logObj[log] ? logObj[log].push(channel.id) : logObj[log] = [channel.id];
            } else {
                logObj = {};
                logObj[log] = [channel.id];
            }
            await bot.r.table("guildSettings").filter({ guildID: msg.guild.id }).update({ logs: logObj }).run();
        }
        msg.channel.createMessage(`${bot.config.emojis.check} ${channel.mention} is now a log of the type \`${log}\``);
    }
}
