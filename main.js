const Utils = require("./resources/Utils.js");
const Eris = require("eris");
const bot = new Eris(Utils.getSecrets().token, {
  getAllUsers: true,
  defaultImageFormat: "png",
  defaultImageSize: 1024
});
const fs = require("fs");
const r = require("rethinkdbdash")({
  db: "renegade_db"
});

Utils.db = r;
bot.utils = Utils;
bot.r = r;
bot.config = require("./resources/config.json");
bot.secrets = require("./resources/secrets.json");
bot.commands = [];

fs.readdir("./commands", (error, files) => {
  if (error) throw error;
  files.forEach((index) => {
    bot.commands[index.replace(/\..*/g, "")] = require("./commands/" + index);
  });
});

fs.readdir("./events", (error, files) => {
  if (error) throw error;
  files.forEach((index) => {
    const event = require("./events/" + index);
    event(bot);
  });
});

bot.connect();
