const Discord = require("discord.js");
const config = require("./config.json");
const client = new Discord.Client();
const prefix = config.prefix;

// Useful variables
const kickDict = {};
const kick_threshold = 0.1;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", message => {
  // Check if message is directed at bot
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  // Parse the message as command and arguments
  const args = message.content.slice(prefix.length).split(" ");
  const command = args.shift().toLowerCase();

  // Different commands
  if (command == "votekick") {
    // Usage checking
    if (!args.length || !message.mentions.users.size) {
      return error(message, `\`Usage: ${command} @user\``);
    }
    message.mentions.members.forEach(member => {
      voteKick(message, member);
    });
  }
});

// Login
client.login(config.token);

// Reply with an error message
function error(message, errorMsg) {
  message.channel.send(errorMsg);
}

// Vote kick function
function voteKick(message, member) {
  const userID = member.user.id;
  const guildID = member.guild.id;
  const guildMembers = member.guild.memberCount;

  // Check if the targeted user is immune to kick
  if (member.hasPermission("ADMINISTRATOR")) {
    return error(message, "You cannot kick the admin!");
  } else if (member.user.bot) {
    return error(message, "You cannot kick a bot!");
  }

  // Check if dictionary for this guild exist
  if (!kickDict[guildID]) {
    kickDict[guildID] = {};
  }

  // Add a vote for the target user
  if (kickDict[guildID][userID]) {
    kickDict[guildID][userID]++;
  } else {
    kickDict[guildID][userID] = 1;
  }

  const voteCount = kickDict[guildID][userID];

  // Decide whether to kick the user
  //memCount * kick_Fthreshold
  if (voteCount > 1000) {
    user.kick("You have been vote kicked!");
    message.channel.send(
      new Discord.MessageEmbed()
        .setDescription(`**<@${userID}> is kicked!**`)
        .setFooter(`Last voted by ${message.author.username}`)
    );
    delete kickDict[guildID][userID];
  } else {
    message.channel.send(
      new Discord.MessageEmbed()
        .setDescription(`**Vote kick added for <@${userID}>.**`)
        .addField(`Current votes`, `${voteCount}`)
        .addField(`Required votes`, `${guildMembers * kick_threshold}`)
        .setFooter(`Last voted by ${message.author.username}`)
    );
  }
}
