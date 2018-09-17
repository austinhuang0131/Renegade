module.exports = (bot) => {
    bot.on('ready', async() => {
         console.log(`Ready! | ${bot.guilds.size} servers | ${bot.users.size} users`);
         bot.editStatus("online", {
                 name: "servers",
                 type: 3
             });
         });
       
}