const config = require("../config.json");
const prefix = config.prefix;

module.exports = {
  help: help,
};

function help(args, message) {
  return message.channel.send("**No one is going to help you!**");
}
