const config = require("../config.json");
const prefix = config.prefix;

module.exports = {
    say: main,
    queue_say: say,
}

// Using Google Translate TTS
const ttsUrl = "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q="

// Import variables from voice.js
const voice = require("./voice")
const queues = voice.queues;
const dispatchers = voice.dispatchers

function main(args, message) {

    // Usage and error checking
    if (!args.length) {
        return message.channel.send(`⚠ **Usage**: \`${prefix}say "message"\``);
    } else if (message.member.voice.channel == undefined) {
        return message.channel.send("**⚠ You must be in a voice channel to use this command!**");
    } else if (args.length > 35) {
        return message.channel.send("**⚠ Maximum length is 35 words!**");
    }

    // Encode the message
    let msg = encodeURI(args.join(" "))

    // Add msg to queue
    voice.queue_add(message, {
        type: "say",
        value: msg,
    })
}

function say(vcID, connection, msg, volume) {

    // Play the TTS message
    const dispatcher = connection.play(ttsUrl + msg, { volume: volume });
    dispatchers[vcID] = dispatcher;

    return dispatcher;
}