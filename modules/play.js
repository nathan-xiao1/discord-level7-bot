const ytdl = require('ytdl-core-discord');
const config = require("../config.json");
const prefix = config.prefix;

module.exports = {
    play: main,
    queue_play: play,
}

// Import variables from voice.js
const voice = require("./voice")
const queues = voice.queues;
const dispatchers = voice.dispatchers

let volume = 1;

function main(args, message) {

    // Usage and error checking
    if (args.length != 1) {
        return message.channel.send(`⚠ **Usage**: \`${prefix}play url\``);
    } else if (message.member.voice.channel == undefined) {
        return message.channel.send("**⚠ You must be in a voice channel to use this command!**");
    }

    // Get URL
    const url = args[0];

    // Add message to queue
    const vcID = message.member.voice.channel.id;

    // Add url to queue
    voice.queue_add(message, {
        type: "play",
        value: url,
    })

}

async function play(vcID, connection, url) {
    try {
        // Play a YouTube URL
        const dispatcher = connection.play(await ytdl(url), {
            type: 'opus',
            volume: volume
        });
        dispatchers[vcID] = dispatcher;
        return dispatcher
    } catch (e) {
        console.log(e)
        return undefined
    }
}