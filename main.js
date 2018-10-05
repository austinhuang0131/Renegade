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

  async function loadCommands() {
    const cmdContents = await readdir("./commands", { withFileTypes: true });
    cmdContents.forEach(async content => {
      if (content.isDirectory()) {
        const category = content.name;
        const cmdFiles = await readdir(`./commands/${category}`);
        cmdFiles.forEach(f => {
          if (!f.endsWith(".js")) return;
          bot.commands[f.replace(/\..*/g, "")] = require(`./commands/${category}/${f}`);
        });
      } else {
        if (!content.name.endsWith(".js")) return;
        bot.commands[f.replace(/\..*/g, "")] = require(`./commands/${content.name}`);
      }
    });
  }

  async function loadEvents() {
    const eventContents = await readdir("./events", { withFileTypes: true });
    eventContents.forEach(async content => {
      if (content.isDirectory()) {
        const category = content.name;
        const eventFiles = await readdir(`./events/${category}`);
        eventFiles.forEach(f => {
          if (!f.endsWith(".js")) return;
          const event = require(`./events/${category}/${f}`);
          event(bot);
        });
      } else {
        if (!content.name.endsWith(".js")) return;
        const event = require(`./events/${content.name}`);
        event(bot);
      }
    });
  }

  await loadCommands();
  await loadEvents();
  await bot.connect();
}

init();