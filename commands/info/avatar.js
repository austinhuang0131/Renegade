module.exports = {
	commands: [
		"avatar"
	],
	description: "Shows the avatar of the mentioned user, it will show your own avatar if no mention is provided.",
	example: "avatar @aTmG",
	args: [{
		name: "user",
		description: "The user you want the avatar from",
		optional: true
	}],
	hidden: false,
	execute: (bot, msg, args) => {
		let mentioned = bot.utils.findMember(msg.guild, args[0]);
		if (!mentioned) {
			mentioned = msg.member;
		}
		msg.channel.createMessage({
			embed: {
				color: bot.config.colors.embedColor,
				author: {
					name: `Avatar for ${mentioned.user.username}`,
					url: mentioned.user.avatarURL
				},
				image: {
					url: mentioned.user.avatarURL
				}
			}
		});
	}
};
