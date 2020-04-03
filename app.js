const Discord = require("discord.js");
const config = require("./config.json");
const Sequelize = require('sequelize');
const { KickVotes } = require('./dbObjects');

const voteKick = require('./modules/kick');

const client = new Discord.Client();
const prefix = config.prefix;

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", message => {
  // Check if message is directed at bot
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  // Parse the message as command and arguments
  const args = message.content.slice(prefix.length).split(" ");
  const command = args.shift().toLowerCase();

  // Different commands
  if (command == "help") {
    return message.channel.send("**No one is going to help you**")
  } else if (command == "kick") {
    if (!args.length || !message.mentions.users.size) {
      return message.channel.send(`\`Usage: !${command} @user\``);
    }
    message.mentions.members.forEach(member => {
      voteKick.vote(message, member);
    })
  } else if (command == "unkick") {
    if (!args.length || !message.mentions.users.size) {
      return message.channel.send(`\`Usage: !${command} @user\``);
    }
    message.mentions.members.forEach(member => {
      voteKick.unvote(message, member);
    });
  } else if (command == "record") {
    voteKick.view(message);
  }
});

// Login
client.login(config.token);