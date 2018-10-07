module.exports = {
  commands: [
    "addrole",
    "roleadd"
  ],
  description: "Adds a role to the specified user",
  example: "addrole @aTmG King",
  args: [{
    name: "user",
    description: "The user you want the role to be given to"
  },
  {
    name: "role",
    description: "The role you want the user to get"
  }
  ],
  clientPerms: ["manageRoles"],
  userPerms: ["manageRoles"],
  execute: async (bot, msg, args) => {
    let member = bot.utils.findMember(msg.guild, args[0]);
    if (!member) return msg.channel.createMessage(`${bot.config.emojis.x} I could not find the \`${args[0]}\` role`);
    let role = bot.utils.findRole(msg.guild, args[1]);
    if (!role) return msg.channel.createMessage(`${bot.config.emojis.x} I could not find the \`${args[1]}\` role`);
    if ((msg.member.highestRole.position <= member.highestRole.position ||
      member == msg.guild.owner) &&
      msg.author.id != msg.guild.ownerID) return msg.channel.createMessage(`${bot.config.emojis.x} You do not have permission to manage roles for this user.`);
    if (member.roles[role.id]) return msg.channel.createMessage(`${bot.config.emojis.x} That user already has that role.`);
    if (role.managed) return msg.channel.createMessage(`${bot.config.emojis.x} That role is managed by an integration. You can not manage this role.`);
    member.addRole(role.id, `Role added by: ${msg.author.username}#${msg.author.discriminator}`).then(() => {
      msg.channel.createMessage(`${bot.config.emojis.check} Successfully added the \`${role.name}\` role to \`${member.user.username}\``);
    }).catch((e) => {
      msg.channel.createMessage(`${bot.config.emojis.x} An error has occured when trying to add roles.`);
      console.error(e.stack);
    });
  }
}