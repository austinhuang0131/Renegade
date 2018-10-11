module.exports = {
    commands: [
        "autorole"
    ],
    description: "Make a role get added upon a member's join",
    example: "autorole add Member",
    args: [
        {
            name: "action",
            description: "Do you want to `add` or `remove` an autorole?"
        },
        {
            name: "role",
            description: "The role you want to manage"
        }
    ],
    clientPerms: ["manageRoles"],
    userPerms: ["manageRoles"],
    execute: async (bot, msg, args) => {
        let data = await bot.r.table("guildSettings").filter({ guildID: msg.guild.id }).run();
        let role = bot.utils.findRole(msg.guild, args[1]);
        if (!role) return msg.channel.createMessage(`${bot.config.emojis.x} I could not find that role`);
        if (msg.member.highestRole.position <= role.position && msg.author.id != msg.guild.ownerID) return msg.channel.createMessage(`${bot.config.emojis.x} You are not able to manage that role`);
        if (role.managed) return msg.channel.createMessage(`${bot.config.emojis.x} That role is managed by an integration. You can not manage those roles.`);
        let action = args[0].toLowerCase();
        if (action == "add") {
            if (data[0] && data[0].autoRoles) {
                if (data[0].autoRoles.includes(role.id)) return msg.channel.createMessage(`${bot.config.emojis.x} That role is already an autorole.`);
                data[0].autoRoles.push(role.id);
                await bot.r.table("guildSettings").filter({ guildID: msg.guild.id }).update({ autoRoles: data[0].autoRoles }).run();
            } else {
                if (!data[0]) await bot.r.table("guildSettings").insert({ guildID: msg.guild.id, autoRoles: [role.id] }).run();
                else await bot.r.table("guildSettings").update({ autoRoles: [role.id] }).run();
            }
            msg.channel.createMessage(`${bot.config.emojis.check} \`${role.name}\` is now an autorole.`);
        } else if (action == "remove" || action == "rm") {
            if (!data[0] || !data[0].autoRoles) return msg.channel.createMessage(`${bot.config.emojis.x} This server has no public roles.`);
            if (!data[0].autoRoles.includes(role.id)) return msg.channel.createMessage(`${bot.config.emojis.x} That role is not an autorole.`);
            data[0].autoRoles = data[0].autoRoles.filter(id => id != role.id);
            if (data[0].autoRoles.length < 1) {
                delete data[0].autoRoles;
                if (Object.keys(data[0]).length - 1 == 1) await bot.r.table("guildSettings").filter({ guildID: msg.guild.id }).delete().run();
                else await bot.r.table("guildSettings").filter({ guildID: msg.guild.id }).replace(bot.r.row.without("autoRoles")).run();
            } else {
                await bot.r.table("guildSettings").filter({ guildID: msg.guild.id }).update({ autoRoles: data[0].autoRoles }).run();
            }
            msg.channel.createMessage(`${bot.config.emojis.check} \`${role.name}\` is no longer an autorole.`);
        } else {
            msg.channel.createMessage(`${bot.config.emojis.x} Invalid action. You can only \`add\` or \`remove\` public roles.`);
        }
    }
}