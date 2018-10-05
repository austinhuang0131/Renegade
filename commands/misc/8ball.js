module.exports = {
    commands: [
        "8ball"
    ],
    description: "Ask the magic 8-ball something",
    example: "8ball will I win the lottery?",
    args: [
        {
            name: "question",
            description: "The question you will ask the 8-ball"
        }
    ],
    execute: async (bot, msg) => {
        const responses = [
            "It is certain.",
            "Without a doubt.",
            "Yes - definitely.",
            "As I see it, yes.",
            "Signs point to yes.",
            "Reply hazy, try again",
            "Ask again later.",
            "Better not tell you now.",
            "Cannot predict now.",
            "Concentrate and ask again.",
            "Don't count on it.",
            "My reply is no.",
            "My sources say no.",
            "Outlook not so good.",
            "Very doubtful."
        ];
        /* Responses at: https://en.wikipedia.org/wiki/Magic_8-Ball. 10 are affirmative, 5 neutral, and 5 are negative.
           5 of the affirmative ones have been removed to make it more even. */
        const response = responses[Math.floor(Math.random() * responses.length)];
        msg.channel.createMessage(`${msg.author.mention}, 🎱 ${response}`);
    }
}