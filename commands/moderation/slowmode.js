// thanks to https://github.com/MaxGrosshandler/Steak-Knight/blob/4202181827ac0baebcfb39b70535abc67b83f819/commands/slowmode.js
const Endpoints = require("eris/lib/rest/Endpoints");
module.exports = {
    commands: [
        "slowmode"
    ],
    description: "Set the time a user must wait to send another message",
    example: "slowmode #general 10",
    clientPerms: ["manageChannels"],
    userPerms: ["manageChannels"],
    args: [
        {
            name: "channel",
            description: "The channel that this will take place in.",
            optional: true
        },
        {
            name: "time",
            description: "The amount of time that a user must wait in seconds (use 0 or off to disable)"
        }
    ],
    execute: async (bot, msg, args) => {
        let channel;
        let time;
        if (args.length < 2) {
            // ?slowmode 10
            channel = msg.channel;
            time = parseInt(args[0]);
        } else {
            channel = bot.utils.findChannel(args[0]);
            time = parseInt(args[1]);
        }
        if (args[0] == "off") time = 0;
        if (!channel) return msg.channel.createMessage(`${bot.config.emojis.x} I could not find that channel.`);
        if (isNaN(time) || time < 0 || time > 120) return msg.channel.createMessage(`${bot.config.emojis.x} Time must be a number at least 0 and no less than 120`);
        const endpoint = Endpoints.CHANNEL(channel.id);
        try {
            await bot.requestHandler.request('PATCH', endpoint, true, {
                rate_limit_per_user: time,
            });
            if (time > 0) msg.channel.createMessage(`${bot.config.emojis.check} Slowmode for this channel has been set to **${time}** seconds.`);
            else msg.channel.createMessage(`${bot.config.emojis.check} Slowmode for this channel has been turned off.`);
        }
        catch (e) {
            msg.channel.createMessage(`${bot.config.emojis.x} An error caused me to be unable to do that.`);
            console.error(e);
        }
    }
}