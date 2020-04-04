const Discord = require("discord.js");
const config = require("./config.json");
const Sequelize = require('sequelize');
const { KickVotes } = require('./dbObjects');

// Import modules
const voteKick = require('./modules/kick');
const utils = require('./modules/utils');
const play = require('./modules/play');

const client = new Discord.Client();
const prefix = config.prefix;

// Available commands
const commands = {
  "help": utils.help,
  "kick": voteKick.kick,
  "unkick": voteKick.unkick,
  "viewkicks": voteKick.viewKicks,
  "play": play.play,
  "volume": play.volume,
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", message => {
  // Check if message is directed at bot
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  // Parse the message as command and arguments
  const args = message.content.slice(prefix.length).split(" ");
  const command = args.shift().toLowerCase();

  // Execute command
  if (commands[command] != undefined) {
    return commands[command](args, message);
  }
});

// Login to Discord
client.login(config.token);