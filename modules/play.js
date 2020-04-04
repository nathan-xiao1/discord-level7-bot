const config = require("../config.json");
const prefix = config.prefix;

const ytdl = require('ytdl-core-discord');

module.exports = {
    play: play,
    volume: setVolume,
}

let volume = 1;

async function play(args, message) {

    if (args.length != 1) {
        return message.channel.send(`⚠ **Usage**: \`${prefix}play url\``);
    } else if (message.member.voice.channel == undefined) {
        return message.channel.send("**⚠ You must be in a voice channel to use this command!**");
    }

    const url = args[0];

    // Join channel
    const connection = await message.member.voice.channel.join();

    // Create a dispatcher
    let dispatcher;
    try {
        dispatcher = connection.play(await ytdl(url), {
            type: 'opus',
            volume: volume
        });
    } catch (e) {
        return message.channel.send(`**⚠ Invalid URL:** \`${url}\``);
    }
    
    dispatcher.on('error', () => {
        message.channel.send("**⚠ Oh no! Something went wrong.**");
    });
}

function setVolume(args, message) {

    if (args.length != 1) {
        return message.channel.send(`⚠ **Usage**: \`${prefix}volume value\``);
    } else if (args[0] < 0 || args[0] > 1) {
        return message.channel.send('⚠ **Value must between 0 and 1 inclusive!**');
    }
    
    // Change volume
    volume = args[0];
    return message.channel.send(`✅ **Volume set to '${volume}'. New volume will apply on next '${prefix}play'.**`);
}