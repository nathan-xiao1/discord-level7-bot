const Discord = require("discord.js");
const { KickVotes } = require("./../dbObjects");

const kick_threshold = 0.25;

module.exports = {
  vote: async function vote(message, member) {
      
    const userID = member.user.id;
    const guildMembers = member.guild.memberCount;
    const authorID = message.author.id;

    // Check if the targeted user is immune to kick or is self
    if (member.hasPermission("ADMINISTRATOR")) {
      return message.channel.send("**⚠ You cannot kick the admin!**");
    } else if (member.user.bot) {
      return message.channel.send("**⚠ You cannot kick a bot!**");
    } else if (userID == authorID) {
      return message.channel.send("**⚠ You cannot kick yourself!**");
    }

    // Find or create entry in database
    let entry = await KickVotes.findOne({
      where: { user_id: userID }
    });

    if (!entry) {
      try {
        entry = await KickVotes.create({
          user_id: userID,
          counts: 0
        });
      } catch (e) {
        if (e.name === "SequelizeUniqueConstraintError") {
          return message.reply("**⚠ That entry already exists.**");
        }
        return message.channel.send(`**⚠ Something went wrong: ${e}**`);
      }
    }

    // Check if voter has already voted
    const voters = entry.voters;
    if (voters.includes(authorID)) {
      return message.channel.send(`**⚠ You have already voted for <@${userID}>**`);
    }

    // Update voters
    voters.push(authorID);
    entry.update({ voters: voters, counts: entry.counts + 1 });

    // Decide whether to kick the user
    const nVote = entry.counts;
    const nRequired = Math.floor(guildMembers * kick_threshold);
    if (nVote > nRequired) {
      member.user.kick("**You have been vote kicked!**");
      message.channel.send(`**✅ <@${userID}> is now kicked from the server.**`)
      await KickVotes.destroy({ where: { user_id: userID } });
    } else {
      message.channel.send(
        new Discord.MessageEmbed()
          .setDescription(`**✅ Vote kick added for <@${userID}>.**`)
          .addField(`Current Votes`, `${nVote}`, true)
          .addField(`Required Votes`, `${nRequired}`, true)
          .setFooter(`Last voted by ${message.author.username}`)
      );
    }
  },

  unvote: async function unvote(message, member) {

    const userID = member.user.id;
    const guildMembers = member.guild.memberCount;
    const authorID = message.author.id;

    // Check if the targeted user is immune to unvote kick or is self
    if (member.hasPermission("ADMINISTRATOR")) {
      return message.channel.send("**⚠ You cannot unvote kick the admin!**");
    } else if (member.user.bot) {
      return message.channel.send("**⚠ You cannot unvote kick a bot!**");
    } else if (userID == authorID) {
      return message.channel.send("**⚠ You cannot unvote kick yourself!**");
    }

    // Find or create entry in database
    const entry = await KickVotes.findOne({
      where: { user_id: userID }
    });

    if (!entry) {
      return message.channel.send(`**⚠ There are current no vote for <@${userID}>**`);
    }

    // Check if voter has voted
    const voters = entry.voters;
    if (!voters.includes(authorID)) {
      return message.channel.send(`**⚠ You have not voted for <@${userID}>**`);
    }

    // Remove the voter as voted
    voters.splice(voters.indexOf(authorID), 1);
    entry.update({ voters: voters, counts: entry.counts - 1 });

    // Display result
    message.channel.send(
      new Discord.MessageEmbed()
        .setDescription(`**✅ Vote kick removed for <@${userID}>.**`)
        .addField(`Current Votes`, `${entry.counts}`, true)
        .addField(
          `Required Votes`,
          `${Math.floor(guildMembers * kick_threshold)}`,
          true
        )
    );

    // Remove entry from DB
    await KickVotes.destroy({ where: { user_id: userID } });
  },

  view: async function view(message) {

    const guildMembers = message.guild.memberCount;

    // Get all entries
    const entries = await KickVotes.findAll();
    const nRequired = Math.floor(guildMembers * kick_threshold);

    // Create the result embed
    const embed = new Discord.MessageEmbed()
      .setTitle(`**Vote Kick Records**`);

    if (!entries.length) {
      embed.setDescription("⚠ No entries");
    } else {
      embed.addField(`Required Votes`, `${nRequired}`, true);
    }

    for (const entry of entries) {
      embed.addField("\u200B", `👤 <@${entry.user_id}>`);
      embed.addField(`Current Votes`, `${entry.counts}`, true);
      embed.addField(`Needed Votes`, `${nRequired - entry.counts}`, true);
    }

    message.channel.send(embed);
  }
};