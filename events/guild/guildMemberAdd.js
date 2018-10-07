module.exports = (bot) => {
    bot.on("guildMemberAdd", async (guild, member) => {
        let data = await bot.r.table("guildSettings").filter({ guildID: guild.id }).run();
        if (!data[0] || !data[0].autoRoles) return;
        let autoRoles = data[0].autoRoles;
        autoRoles.forEach(roleID => member.addRole(roleID, "Autorole"));
    });
}