const config = require("../config.json");
const prefix = config.prefix;

module.exports = {
    say: main,
    pause: pause,
}

// Using Google Translate TTS
const ttsUrl = "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q="

const queues = {};
const dispatchers = {};

function main(args, message) {

    if (!args.length) {
        return message.channel.send(`⚠ **Usage**: \`${prefix}say "message"\``);
    } else if (message.member.voice.channel == undefined) {
        return message.channel.send("**⚠ You must be in a voice channel to use this command!**");
    } else if (args.length > 35) {
        return message.channel.send("**⚠ Maximum length is 35 words!**");
    }

    // Encode the message
    let msg = encodeURI(args.join(" "))

    // Add message to queue
    const vcID = message.member.voice.channel.id;

    // Play if first in queue
    if (!queues[vcID]) {
        queues[vcID] = [msg.valueOf()];
        say(vcID, message);
    } else {
        queues[vcID].push(msg.valueOf())
    }
    
}

async function say(vcID, message) {

    // Join channel
    const connection = await message.member.voice.channel.join();

    // Get message from queue
    const msg = queues[vcID].shift();

    // Play the TTS message
    const dispatcher = connection.play(ttsUrl + msg);
    dispatchers[vcID] = dispatcher;

    dispatcher.on('finish', () => {
        if (queues[vcID][0]) {
            say(vcID, message);
        } else {
            delete queues[vcID];
            delete dispatchers[vcID];
        }
    });
    
    dispatcher.on('error', () => {
        message.channel.send("**⚠ Oh no! Something went wrong.**");
    });

}

function pause(args, message) {

    const vcID = message.member.voice.channel.id;

    // Get dispatcher
    if (dispatchers[vcID]) {
        dispatchers[vcID].pause();
    } else {
        return message.channel.send("**⚠ There is nothing to pause right now!**");
    }
    return message.channel.send("**✅ Paused!**");
}