module.exports = {
    commands: [
        "ping"
    ],
    description: "Check my response time.",
    category: "Info/Util",
    hidden: false,
    execute: async (bot, msg) => {
        msg.channel.createMessage({
            content: "Pong! 🏓",
            embed: {
                color: bot.config.colors.embedColor,
                description: `API Latency: \`${msg.channel.guild.shard.latency}ms\``
            }
        });
    }
}