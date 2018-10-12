module.exports = {
    commands: [
        "spook"
    ],
    description: "spooky spooky",
    example: "spook",
    execute: async (bot, msg) => {
        msg.channel.createMessage(`https://giphy.com/gifs/guys-spooky-IRZE8JX2BQikM`);
    }
}
