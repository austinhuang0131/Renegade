module.exports = (bot) => {
    bot.on("messageCreate", async (msg) => {
        await bot.utils.handleMessage(bot, msg);
    });
}