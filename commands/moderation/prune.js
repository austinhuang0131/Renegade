module.exports = {
    commands: [
        "prune",
        "purge"
    ],
    description: "Mass delete messages in a channel",
    example: "prune @aTmG 50",
    clientPerms: ["manageMessages"],
    userPerms: ["manageMessages"],
    args: [
        {
            name: "amount",
            description: "The amount of messages that should be deleted"
        }
    ],
    execute: async (bot, msg, args) => {
        let amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 2 || amount > 1000) return msg.channel.createMessage(`${bot.config.emojis.x} The amount should be a number at least 2 and no larger than 1000.`);
        await msg.delete();
        await msg.channel.purge(amount).catch(e => {
            msg.channel.createMessage(`${bot.config.emojis.x} An occured that caused me not to be able to do this.`);
            console.error(e);
        });
        const m = await msg.channel.createMessage(`${bot.config.emojis.check} Prune operation completed.`);
        setTimeout(async () => {
            await m.delete();
        }, 1000);
    }
}