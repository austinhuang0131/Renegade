// snippit from https://github.com/mathiasbynens/esrever/blob/master/esrever.js
module.exports = {
	commands: [
		"reverse",
		"reverseText"
	],
	description: "Reverse text",
	example: "reverse Hello World!",
	args: [
		{
			name: "text",
			description: "The text to be reversed"
		}
	],
	execute: async (bot, msg, args) => {
		let text = args.join(" ");
		const regexSymbolWithCombiningMarks = /([\0-\u02FF\u0370-\u1AAF\u1B00-\u1DBF\u1E00-\u20CF\u2100-\uD7FF\uE000-\uFE1F\uFE30-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])([\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]+)/g;
		const regexSurrogatePair = /([\uD800-\uDBFF])([\uDC00-\uDFFF])/g;
		function reverse(string) {
			string = string
				.replace(regexSymbolWithCombiningMarks, function ($0, $1, $2) {
					return reverse($2) + $1;
				})
				.replace(regexSurrogatePair, "$2$1");
			var result = "";
			var index = string.length;
			while (index) {
				index--;
				result += string.charAt(index);
			}
			return result;
		}
		/* lol xd what a noob why don't you use string.split('').reverse().join('')?????????
        Look at: https://github.com/mathiasbynens/esrever/blob/master/README.md */
		let reversed = reverse(text);
		msg.channel.createMessage(reversed);
	}
};