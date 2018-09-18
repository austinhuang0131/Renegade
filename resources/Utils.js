const config = require("./config.json");
const secrets = require("./secrets.json");
const ordinal = require("ordinal");
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
                    if (!data[0]) return null;
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
                        cmd.args.forEach(arg => strings.push(`**${arg.name}** - ${arg.description} - (${arg.optional ? "Optional" : "Not Optional"})`));
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

                channelIsBlocked: async function (channel) {
                        let r = this.getDB();
                        let data = await r.table("ignoredchannels").filter({
                            guildId: `${channel.guild.id}`
                        }).run();
                        if (!data[0]) return false;
                        let blockedChannels = data[0].channelId;
                        if (!blockedChannels.includes(channel.id)) return false;
                        return true;
                    },

                    triggeredMaxMentions: async function (msg) {
                            let r = this.getDB();
                            let data = await r.table("maxmentions").filter({
                                guildId: msg.channel.guild.id
                            }).run();
                            let maxMentions;
                            if (!data[0]) maxMentions = undefined;
                            else maxMentions = parseInt(data[0].max);
                            return msg.mentions.length - msg.mentions.filter(u => u.bot).length >= maxMentions;
                        },

                        triggeredAntiInvite: async function (msg) {
                                if (msg.content.includes("discord.gg/") || msg.content.includes("discordapp.com/invite/")) return true;
                                return false;
                            },

                            handleMessage: async function (bot, msg) {
                                    if (msg.author.bot) return;
                                    if (!msg.channel.guild) return;
                                    // if (await this.channelBlocked(msg.channel)) return;
                                    await this.antiSpam(msg);

                                    if (await this.triggeredMaxMentions(msg)) {
                                        if (msg.member.permission.has("ADMINISTRATOR")) return;
                                        let botmember = msg.channel.guild.members.get(bot.user.id);
                                        if (!botmember.permission.has("MANAGE_MESSAGES")) return;
                                        msg.delete();
                                        msg.reply(`You sent too many unique mentions!`);
                                    }


                                    if (await this.triggeredAntiInvite(msg)) {
                                        if (msg.member.permission.has('ADMINISTRATOR')) return;
                                        r.table("antiinvite").filter({
                                            guildId: msg.channel.guild.id
                                        }).run().then(row => {
                                            if (!row[0]) return;
                                            let botmember = msg.channel.guild.members.get(bot.user.id);
                                            if (!botmember.permission.has("MANAGE_MESSAGES")) return;
                                            msg.delete();
                                            msg.reply(`:shield: | This server is guarded by AntiInvite, you can not post invite links here!`);
                                        })
                                    }

                                    await this.handleXP(msg);
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
                                    let command = Object.keys(bot.commands).filter((c) => bot.commands[c].commands.indexOf(msg.content.toLowerCase().replace(prefix.toLowerCase(), "").split(" ")[0]) > -1);
                                    if (command.length < 1) return;

                                    // TODO: add perm node support
                                    if (bot.commands[command[0]].perms) {
                                        let botPermsNeeded = [];
                                        let userPermsNeeded = [];
                                        bot.commands[command[0]].perms.forEach(permissionObj => {
                                            // errors more useful than NodeJS errors lmao
                                            if (!permissionObj.type) throw "Permission objects must have types";
                                            if (!permissionObj.perms) throw "Permission objects must have permissions";
                                            if (!permissionObj.perms instanceof Array) throw "Permission objects' perms value must be an array";
                                            switch (permissionObj.type.toLowerCase()) {
                                                case "bot":
                                                    permissionObj.perms.forEach(perm => {
                                                        let botmember = msg.channel.guild.members.get(bot.user.id);
                                                        if (!botmember.permission.has(perm)) botPermsNeeded.push(perm);
                                                    });
                                                    break;
                                                case "user":
                                                    permissionObj.perms.forEach(perm => {
                                                        if (!msg.member.permission.has(perm)) userPermsNeeded.push(perm);
                                                    });
                                                    break;
                                                default:
                                                    throw "Permission types must be of types bot or user"
                                            }
                                        });
                                        if (botPermsNeeded.length > 0) return msg.channel.createMessage(`${config.emojis.x} I do not have enough permissions to do that.\nPermissions Needed: \`${botPermsNeeded.join(", ")}\``);
                                        if (userPermsNeeded.length > 0) return msg.channel.createMessage(`${config.emojis.x} You do not have enough permissions to do that.\nPermissions Needed: \`${userPermsNeeded.join(", ")}\``);
                                    }


                                    const args = ((msg.content.replace(prefix, "").split(" ").length > 1) ? msg.content.replace(prefix, "").split(" ").slice(1) : []);
                                    if (args.length < bot.commands[command[0]].args.filter(a => !a.optional).length) return msg.channel.createMessage(this.createHelpEmbed(bot.commands[command[0]], "It looks like you do not have enough arguments!"));
                                    try {
                                        await bot.commands[command[0]].execute(bot, msg, args);
                                        console.log(`Command Log: The ${command} command was used`);
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

                                handleXP: async function (msg) {
                                        let r = this.getDB();
                                        if (msg.author.bot) return;
                                        var foo = await r.table("xp").filter({
                                            guildId: `${msg.channel.guild.id}`
                                        }).run();
                                        if (!foo[0]) return;

                                        let user = msg.author.id;
                                        if (foo[0].bannedusers.length > 0) {
                                            if (foo[0].bannedusers.includes(user)) return;
                                        }

                                        if (foo[0].bannedroles.length > 0) {
                                            let isBanned = false;
                                            foo[0].bannedroles.forEach(role => {
                                                if (msg.member.roles.has(role)) isBanned = true;
                                            })
                                            if (isBanned) return;
                                        }

                                        let timestamp = msg.timestamp;

                                        function getLvl(xp) {
                                            let num = xp / 75;
                                            let newnum = parseInt(Math.sqrt(num));
                                            let finalnum = Math.pow(newnum, 2) + newnum;
                                            if (num >= finalnum) {
                                                return newnum;
                                            } else {
                                                return newnum - 1;
                                            }
                                        }



                                        function getRolesForLvl(lvl) {
                                            let arr = [];
                                            if (foo[0].rewards[0]) {
                                                for (var i = 0; i < foo[0].rewards.length; i++) {
                                                    if (foo[0].rewards[i] && foo[0].rewards[i].lvl <= lvl) {
                                                        arr.push(foo[0].rewards[i].roleId);
                                                    }
                                                }
                                            }
                                            return arr;
                                        }


                                        let newxp = Math.floor(Math.random() * 50) + 1;
                                        let users = foo[0].users;
                                        let userish = users.filter(u => u.userId === user);
                                        let _user = userish[0];
                                        let olduserdata = _user;
                                        let newuserdata;
                                        if (!olduserdata) {
                                            const random = newxp;
                                            newuserdata = {
                                                userId: msg.author.id,
                                                xp: random,
                                                lvl: getLvl(random),
                                                lastxpget: msg.timestamp
                                            };
                                            users.push(newuserdata);
                                            r.table("xp").filter({
                                                guildId: msg.channel.guild.id
                                            }).update({
                                                users: users
                                            }).run();
                                            return;
                                        } else {
                                            if (timestamp - olduserdata.lastxpget < 60000) return;
                                            const rnd = newxp;
                                            newuserdata = {
                                                userId: msg.author.id,
                                                xp: _user.xp + rnd,
                                                lvl: getLvl(_user.xp + rnd),
                                                lastxpget: msg.timestamp
                                            };
                                            let thingie = foo[0].users.filter(u => u.userId !== msg.author.id);
                                            thingie.push(newuserdata);
                                            r.table("xp").filter({
                                                guildId: msg.channel.guild.id
                                            }).update({
                                                users: thingie
                                            }).run();
                                        }

                                        function getRanking(xp) {
                                            var u = foo[0].users;
                                            let _u = u.filter(u => u.userId === msg.member.user.id);
                                            var scores = new Set(Object.keys(u).map(function (key) {
                                                return u[key].xp;
                                            }));
                                            var ordered_scores = Array.from(scores).sort(function (a, b) {
                                                return b - a;
                                            });
                                            return ordered_scores.indexOf(_u[0].xp) + 1;
                                        }

                                        if (olduserdata && olduserdata.lvl < newuserdata.lvl) {
                                            let lvlupmsg = foo[0].lvlupmsg;
                                            if (lvlupmsg) {
                                                let username = msg.author.username;
                                                let mention = msg.author.toString();
                                                let xp = newuserdata.xp;
                                                let level = newuserdata.lvl;
                                                let place = ordinal(getRanking(newuserdata.xp));
                                                let string = lvlupmsg.replace('{USER}', username).replace('{MENTION}', mention).replace('{XP}', xp).replace('{LEVEL}', level).replace('{PLACE}', place);
                                                msg.channel.send(string);
                                            } else {
                                                msg.channel.send(`GG ${msg.author}, you are now level **${newuserdata.lvl}**`);
                                            }
                                        }
                                        if (foo[0].rewards[0] && getRolesForLvl(newuserdata.lvl).length > 0) {
                                            let alldemroles = getRolesForLvl(newuserdata.lvl);
                                            alldemroles.forEach(r => {
                                                if (msg.member.roles.has(r)) return;
                                                msg.member.addRole(r);
                                            });
                                        }
                                    },


                                    antiSpam: async function (msg) {
                                            let r = this.getDB();
                                            if (msg.author.bot) return;
                                            if (msg.member.permission.has("ADMINISTRATOR")) return;
                                            var foo = await r.table("antispam").filter({
                                                channelId: `${msg.channel.id}`
                                            }).run();
                                            if (!foo[0]) return;

                                            let user = msg.author.id;
                                            if (!msg.member.lastMessage) return;
                                            let lastMessageTimestamp = msg.member.lastMessage.createdTimestamp;

                                            let users = {};

                                            r.table("antispam").filter({
                                                channelId: msg.channel.id
                                            }).run().then(row => {
                                                if (row[0].users) {
                                                    if (!row[0].users[`${user}`]) {
                                                        users = row[0].users;
                                                        users[`${user}`] = lastMessageTimestamp;
                                                        r.table("antispam").filter({
                                                            channelId: msg.channel.id
                                                        }).update({
                                                            users
                                                        }).run();
                                                    } else {
                                                        if (lastMessageTimestamp - row[0].users[`${user}`] < row[0].time) {
                                                            msg.delete();
                                                        } else {
                                                            users = row[0].users;
                                                            users[`${user}`] = lastMessageTimestamp;
                                                            r.table("antispam").filter({
                                                                channelId: msg.channel.id
                                                            }).update({
                                                                users
                                                            }).run();
                                                        }
                                                    }
                                                } else {
                                                    users[`${user}`] = lastMessageTimestamp;
                                                    r.table("antispam").filter({
                                                        channelId: msg.channel.id
                                                    }).update({
                                                        users
                                                    }).run();
                                                }
                                            });
                                        },

                                        findMember: function (server, user) {
                                            if (!user) return null;
                                            if (!server) return null;
                                            if (/^\d+$/.test(user)) return server.members.get(user); // ID 
                                            else if (/^<@\d+>$/.test(user)) return server.members.get(user.match(/\d+/)[0]); // Mention
                                            else if (/^\w+#\d{4}$/.test(user)) return server.members.filter((m) => m.user.username.toLowerCase() === user.toLowerCase().match(/^\w+/)[0] && m.user.discriminator === String(user.match(/\d{4}/)[0]))[0]; // username and discrim
                                            else if (server.members.filter((m) => m.user.username.toLowerCase() === user.toLowerCase()).length > 0) return server.members.filter((m) => m.user.username.toLowerCase() === user.toLowerCase())[0] // username
                                            return server.members.filter((m) => m.nick && m.nick.toLowerCase() === user.toLowerCase())[0]; //nickname
                                        },

                                        findRole: function (server, role) {
                                            if (!server) return null;
                                            if (!role) return null;
                                            if (/^\d+$/.test(role)) return server.roles.get(role); // ID 
                                            else if (/^<@\d+>$/.test(role)) return server.roles.get(role.match(/\d+/)[0]); // Mention
                                            return server.roles.filter((r) => r.name.toLowerCase() == role.toLowerCase())[0]; // name
                                        }


}