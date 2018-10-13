module.exports = {
	commands: [
		"help"
	],
	description: "Get command help.",
	example: "help avatar",
	args: [{
		name: "command",
		description: "The command you want help with",
		optional: true
	}],
	hidden: false,
	execute: (bot, msg, args) => {
		if (!args[0]) {
			return msg.channel.createMessage({
				embed: {
					color: bot.config.colors.embedColor,
					author: {
						name: `${bot.user.username} help`,
						icon_url: bot.user.avatarURL
					},
					description: "Use help [command] to get help for a command.\nYou can go to the official [github repo](https://github.com/aTmG/Renegade) for extensive help"
				}
			});
		}
		let command = bot.commands[args[0].toLowerCase()];
		if (!command) {
			return msg.channel.createMessage(`${bot.config.emojis.x} The ${args[0]} command does not exist.`);
		}
		msg.channel.createMessage(bot.utils.createHelpEmbed(command));
	}
};