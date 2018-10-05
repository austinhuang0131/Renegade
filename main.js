const Utils = require("./resources/Utils.js");
const Eris = require("eris");
const bot = new Eris(Utils.getSecrets().token, {
  getAllUsers: true,
  defaultImageFormat: "png",
  defaultImageSize: 1024
});
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const r = require("rethinkdbdash")({
  db: "renegade_db"
});

Utils.db = r;
bot.utils = Utils;
bot.r = r;
bot.config = require("./resources/config.json");
bot.secrets = require("./resources/secrets.json");
bot.commands = [];

const init = async () => {
  const cmdFolders = await readdir("./commands", { withFileTypes: true });
  cmdFolders.forEach(async dir => {
    const category = dir.name;
    const cmdFiles = await readdir(`./commands/${category}`);
    cmdFiles.forEach(f => {
      if (!f.endsWith(".js")) return;
      bot.commands[f.replace(/\..*/g, "")] = require(`./commands/${category}/${f}`);
    });
  });

  readdir("./events", (error, files) => {
    if (error) throw error;
    files.forEach((index) => {
      const event = require("./events/" + index);
      event(bot);
    });
  });

  bot.connect();
}

init();
