module.exports = {
  commands: [
    "removerole",
    "rmrole",
    "roleremove",
    "rolerm"
  ],
  description: "Removes a role to the specified user",
  example: "removerole @aTmG King",
  category: "Roles",
  args: [{
      name: "user",
      description: "The user you want the role to be removed from"
    },
    {
      name: "role",
      description: "The role you want the user have removed"
    }
  ],
  perms: [{
    type: "bot",
    perms: ["manageRoles"]
  }, {
    type: "user",
    perms: ["manageRoles"]
  }],
  execute: async (bot, msg, args) => {
    let member = bot.utils.findMember(msg.channel.guild, args[0]);
    if (!member) return msg.channel.createMessage(`${bot.config.emojis.x} I could not find the \`${args[0]}\` role`);
    let role = bot.utils.findRole(msg.channel.guild, args[1]);
    if (!role) return msg.channel.createMessage(`${bot.config.emojis.x} I could not find the \`${args[1]}\` role`);
    member.removeRole(role.id, `Role removed by: ${msg.author.username}#${msg.author.discriminator}`).then(() => {
      msg.channel.createMessage(`${bot.config.emojis.check} Successfully removed the \`${role.name}\` role to \`${member.user.username}\``);
    }).catch((e) => {
      msg.channel.createMessage(`${bot.config.emojis.x} An error has occured when trying to remove roles.`);
      console.error(e.stack);
    });
  }
}