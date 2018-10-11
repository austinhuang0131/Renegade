const config = require("./config.json");
const secrets = require("./secrets.json");
module.exports = {

    db: null,

    getDB: function () {
        return this.db;
    },

    getConfig: function () {
        return config;
    },

    getSecrets: function () {
        return secrets;
    },

    getPrefix: async function (guild) {
        let r = this.getDB();
        let data = await r.table("guildSettings").filter({ guildID: guild.id }).run();
        if (!data[0] || !data[0].prefix) return this.getConfig().prefix;
        else return data[0].prefix;
    },

    getUserPrefix: async function (user) {
        let r = this.getDB();
        let data = await r.table("userprefixes").filter({ userID: user.id }).run();
        if (!data[0]) return null;
        else return data[0].prefix;
    },

    createHelpEmbed: function (cmd, content = null) {
        let fields = [];
        if (cmd.commands.length > 1) {
            fields.push({
                name: "Aliases",
                value: `${cmd.commands.slice(1).join(", ")}`
            });
        }

        if (cmd.args) {
            let strings = [];
            cmd.args.forEach(arg => strings.push(`**${arg.name}** - ${arg.description} - (${arg.optional ? "Optional" : "Required"})`));
            fields.push({
                name: "Arguments",
                value: `${strings.join("\n")}`
            });
        }

        let usage;
        let argStrings = [];
        if (cmd.args) {
            cmd.args.forEach(arg => {
                if (arg.optional) argStrings.push(`[${arg.name}]`);
                else argStrings.push(`<${arg.name}>`);
            });
        }

        argStrings.length > 0 ? usage = `${cmd.commands[0]} ${argStrings.join(" ")}` : usage = `${cmd.commands[0]}`;

        fields.push({
            name: "Usage",
            value: `\`${usage}\``
        });

        if (cmd.example) {
            fields.push({
                name: "Example",
                value: `\`${cmd.example}\``
            });
        }

        let obj = {
            embed: {
                author: {
                    name: `Help for the ${cmd.commands[0]} command`
                },
                description: `**${cmd.description}**`,
                color: config.colors.embedColor,
                fields: fields
            }
        };

        if (content) obj.content = content;
        return obj;
    },

    modLog: async function (guild, moderator, offender, action, reason) {
        let caseNum;
        let data = await this.db.table("guildSettings").filter({ guildID: guild.id }).run();
        if (!data[0] || !data[0].logs || !data[0].logs["mod"]) throw "Tried to create a mod-log with no mod-log data.";
        else {
            data[0].caseNum ? caseNum = data[0].caseNum + 1 : caseNum = 1;
            await this.db.table("guildSettings").filter({ guildID: guild.id }).update({ caseNum: caseNum }).run();
        }
        let string = `➤ **Action:** ${action}\n➤ **Offender:** ${offender.tag} (**${offender.id}**)\n➤ **Reason:** ${reason ? reason : "No reason provided."}`;
        let embed = {
            author: {
                icon_url: moderator.avatarURL,
                name: moderator.tag
            },
            color: config.colors.log[action.toLowerCase()],
            description: string,
            footer: {
                text: `Case #${caseNum}`
            },
            timestamp: new Date()
        };
        let channels = data[0].logs["mod"];
        channels.forEach(id => guild.channels.get(id).createMessage({ embed: embed }));
    },

    handleMessage: async function (bot, msg) {
        if (msg.author.bot) return;
        if (msg.channel.type != 0) return;
        const mentionPrefix = msg.content.match(new RegExp(`<@!?${bot.user.id}>`, 'g'));
        let prefix = await this.getPrefix(msg.guild);
        if (!msg.content.startsWith(await this.getPrefix(msg.guild)) && await this.getUserPrefix(msg.author) && msg.content.startsWith(await this.getUserPrefix(msg.author))) {
            prefix = await this.getUserPrefix(msg.author);
        } else if (mentionPrefix && msg.content.startsWith(mentionPrefix[0])) {
            prefix = `${mentionPrefix[0]} `;
            if (msg.mentions.length > 1) msg.mentions = msg.mentions.slice(1);
            if (msg.mentions.length === 1 && msg.mentions[0] === bot && mentionPrefix.length === 1) msg.mentions = msg.mentions.slice(1);
        }
        if (!msg.content.startsWith(prefix)) return;
        let command = bot.commands[Object.keys(bot.commands).filter((c) => bot.commands[c].commands.indexOf(msg.content.toLowerCase().replace(prefix.toLowerCase(), "").split(" ")[0]) > -1)[0]];
        if (!command) return;
        if (command.devOnly && !this.isDeveloper(msg.author)) return;
        if (command.clientPerms || command.userPerms) {
            let neededClientPerms = [];
            let neededUserPerms = [];
            if (command.clientPerms) {
                command.clientPerms.forEach(cp => {
                    let botmember = msg.guild.members.get(bot.user.id);
                    if (!botmember.permission.has(cp)) neededClientPerms.push(cp);
                });
                if (neededClientPerms.length > 0) return msg.channel.createMessage(`${config.emojis.x} I need more permissions to use this command. Permissions needed: ${neededClientPerms.join(", ")}`);
            }
            if (command.userPerms) {
                command.userPerms.forEach(cp => {
                    if (!msg.member.permission.has(cp)) neededUserPerms.push(cp);
                });
                if (neededUserPerms.length > 0) return msg.channel.createMessage(`${bot.config.emojis.x} You need more permissions to use this command. Permissions needed: ${neededUserPerms.join(", ")}`);
            }
        }
        const args = ((msg.content.replace(prefix, "").trim().split(/ +/g).length > 1) ? msg.content.replace(prefix, "").trim().split(/ +/g).slice(1) : []);
        if (command.args && args.length < command.args.filter(a => !a.optional).length) return msg.channel.createMessage(this.createHelpEmbed(command, "It looks like you do not have enough arguments!"));
        try {
            await command.execute(bot, msg, args);
        } catch (e) {
            msg.channel.createMessage({
                embed: {
                    author: {
                        name: "Command Error"
                    },
                    color: config.colors.red,
                    fields: [{
                        name: "Error",
                        value: `\`\`\`x1\n${e}\n\`\`\``
                    },
                    {
                        name: "What do I do?",
                        value: "Go to the [official server](https://discord.gg/7axYBej) and report the error if you can not solve this."
                    }
                    ]
                }
            });
            console.error(e);
        }
    },


    findMember: function (server, user) {
        if (!server || !user) return undefined;
        if (/^\d+$/.test(user)) return server.members.get(user); // ID 
        else if (/^<@\d+>$/.test(user) || /^<@!\d+>$/.test(user)) return server.members.get(user.match(/\d+/)[0]); // Mention
        else if (/^\w+#\d{4}$/.test(user)) return server.members.filter((m) => m.user.username.toLowerCase() === user.toLowerCase().match(/^\w+/)[0] && m.user.discriminator === String(user.match(/\d{4}/)[0]))[0]; // username and discrim
        else if (server.members.filter((m) => m.user.username.toLowerCase() === user.toLowerCase()).length > 0) return server.members.filter((m) => m.user.username.toLowerCase() === user.toLowerCase())[0] // username
        return server.members.filter((m) => m.nick && m.nick.toLowerCase() === user.toLowerCase())[0]; //nickname
    },

    findRole: function (server, role) {
        if (!server || !role) return undefined;
        if (!role) return undefined;
        if (/^\d+$/.test(role)) return server.roles.get(role); // ID 
        else if (/^<@\d+>$/.test(role)) return server.roles.get(role.match(/\d+/)[0]); // Mention
        return server.roles.filter((r) => r.name.toLowerCase() == role.toLowerCase())[0]; // name
    },

    findChannel: function (server, channel) {
        if (!server || !channel) return undefined;
        if (/^\d+$/.test(channel)) return server.channels.get(channel); // ID 
        else if (/^<#\d+>$/.test(channel)) return server.channels.get(channel.match(/\d+/)[0]); // Mention
        return server.channels.filter((r) => r.name.toLowerCase() == channel.toLowerCase())[0]; // name
    },

    isDeveloper: function (user) {
        return (config.developers && config.developers.includes(user.id));
    }

}