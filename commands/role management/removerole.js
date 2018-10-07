module.exports = {
  commands: [
    "removerole",
    "rmrole",
    "roleremove",
    "rolerm"
  ],
  description: "Removes a role to the specified user",
  example: "removerole @aTmG King",
  args: [{
    name: "user",
    description: "The user you want the role to be removed from"
  },
  {
    name: "role",
    description: "The role you want the user have removed"
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
    if (!member.roles.includes(role.id)) return msg.channel.createMessage(`${bot.config.emojis.x} That user does not have that role.`);
    if (role.managed) return msg.channel.createMessage(`${bot.config.emojis.x} That role is managed by an integration. You can not manage this role.`);
    try {
      await member.removeRole(role.id, `Role removed by: ${msg.author.username}#${msg.author.discriminator}`);
      msg.channel.createMessage(`${bot.config.emojis.check} Successfully removed the \`${role.name}\` role to \`${member.user.username}\``);
    } catch (e) {
      msg.channel.createMessage(`${bot.config.emojis.x} An error has occured when trying to remove roles.`);
      console.error(e);
    }
  }
}