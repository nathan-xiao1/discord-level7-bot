const Discord = require("discord.js");
const config = require("./config.json");
const Sequelize = require('sequelize');
const { KickVotes } = require('./dbObjects');

const voteKick = require('./modules/kick');

const client = new Discord.Client();
const prefix = config.prefix;

// Available commands
const commands = {
  "help": help,
  "kick": kick,
  "unkick": unkick,
  "viewkicks": viewKicks, 
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

// Functions for different commands.
function help(args, message) {

  return message.channel.send("**No one is going to help you!**");
}

function kick(args, message) {
  if (!args.length || !message.mentions.users.size) {
    return message.channel.send(`\`Usage: !${command} @user\``);
  }
  message.mentions.members.forEach(member => {
    voteKick.vote(message, member);
  })
}

function unkick(args, message) {
  if (!args.length || !message.mentions.users.size) {
    return message.channel.send(`\`Usage: !${command} @user\``);
  }
  message.mentions.members.forEach(member => {
    voteKick.unvote(message, member);
  });
}

function viewKicks(args, message) {
  voteKick.view(message);
}