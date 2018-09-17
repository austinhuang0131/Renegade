const Utils = require("../Utils.js");
module.exports = (bot) => {
    bot.on("messageCreate", async (msg) => {
        await Utils.handleMessage(bot, msg);
    });
}