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

    addCase: function (guild) {
        let r = this.getDB();
        r.table("cases").filter({
            guildId: guild.id
        }).run().then(row => {
            if (!row[0]) r.db('modbot_db').table('cases').insert({
                number: 1,
                guildId: `${guild.id}`
            }).run();
            else r.db('modbot_db').table('cases').filter({
                guildId: guild.id
            }).update({
                number: row[0].number + 1,
                guildId: `${guild.id}`
            }).run();
        });
    },

    getCase: async function (guild) {
        let r = this.getDB();
        let data = await r.table("cases").filter({
            guildId: guild.id
        }).run();
        if (!data[0]) return 0;
        else return data[0].number;
    },

    getPrefix: async function (guild) {
        let r = this.getDB();
        let data = await r.table("prefixes").filter({
            guildId: guild.id
        }).run();
        if (!data[0]) return this.getConfig().prefix;
        else return data[0].prefix;
    },

    setPrefix: function (guild, prefix) {
        let r = this.getDB();
        r.table("prefixes").filter({
            guildId: guild.id
        }).run().then(row => {
            let data = row[0];
            if (!data) r.table("prefixes").insert({
                guildId: guild.id,
                prefix: prefix
            }).run();
            else r.table("prefixes").update({
                prefix: prefix
            }).run();
        });
    },

    getUserPrefix: async function (user) {
        let r = this.getDB();
        let data = await r.table("userprefixes").filter({
            userId: user.id
        }).run();
        if (!data[0]) return undefined;
        else return data[0].prefix;
    },

    setUserPrefix: function (user, prefix) {
        let r = this.getDB();
        r.table("userprefixes").filter({
            userId: user.id
        }).run().then(row => {
            let data = row[0];
            if (!data) r.table("userprefixes").insert({
                userId: user.id,
                prefix: prefix
            }).run();
            if (!data) r.table("userprefixes").filter({
                userId: user.id
            }).update({
                prefix: prefix
            }).run();
        });
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

    modLog: async function (offender, operator, action) {

    },

    handleMessage: async function (bot, msg) {
        if (msg.author.bot) return;
        if (!msg.channel.guild) return;
        const mentionPrefix = msg.content.match(new RegExp(`<@!?${bot.user.id}>`, 'g'));
        let prefix = this.getConfig().prefix;
        if (!msg.content.startsWith(await this.getPrefix(msg.channel.guild)) && await this.getUserPrefix(msg.author) && msg.content.startsWith(await this.getUserPrefix(msg.author))) {
            prefix = await userPrefixGet(msg.author);
        } else if (mentionPrefix && msg.content.startsWith(mentionPrefix[0])) {
            prefix = `${mentionPrefix[0]} `;
            if (msg.mentions.length > 1) msg.mentions = msg.mentions.slice(1);
            if (msg.mentions.length === 1 && msg.mentions[0] === bot && mentionPrefix.length === 1) msg.mentions = msg.mentions.slice(1);
        } else {
            prefix = await this.getPrefix(msg.channel.guild);
        }
        if (!msg.content.startsWith((prefix))) return;
        let command = bot.commands[Object.keys(bot.commands).filter((c) => bot.commands[c].commands.indexOf(msg.content.toLowerCase().replace(prefix.toLowerCase(), "").split(" ")[0]) > -1)[0]];
        if (!command) return;
        if (command.clientPerms || command.userPerms) {
            let neededClientPerms = [];
            let neededUserPerms = [];
            command.clientPerms.forEach(cp => {
                let botmember = msg.channel.guild.members.get(bot.user.id);
                if (!botmember.permission.has(cp)) neededClientPerms.push(cp);
            });
            if (neededClientPerms.length > 0) return msg.channel.createMessage(`${config.emojis.x} I need more permissions to use this command. Permissions needed: ${neededClientPerms.join(", ")}`);

            command.userPerms.forEach(cp => {
                if (!msg.member.permission.has(cp)) neededUserPerms.push(cp);
            });
            if (neededUserPerms.length > 0) return msg.channel.createMessage(`${bot.config.emojis.x} You need more permissions to use this command. Permissions needed: ${neededUserPerms.join(", ")}`);
        }
        const args = ((msg.content.replace(prefix, "").split(" ").length > 1) ? msg.content.replace(prefix, "").split(" ").slice(1) : []);
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
        else if (/^<@\d+>$/.test(user) || /^<@!\d+>$/) return server.members.get(user.match(/\d+/)[0]); // Mention
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
        else if (/^<#\d+>$/.test(channel)) return server.channel.get(channel.match(/\d+/)[0]); // Mention
        return server.channels.filter((r) => r.name.toLowerCase() == channel.toLowerCase())[0]; // name
    },

    isDeveloper: function (user) {
        return (config.developers && config.developers.includes(user.id));
    }

}