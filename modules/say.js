const config = require("../config.json");
const prefix = config.prefix;

module.exports = {
    say: say,
}

// Using Google Translate TTS
const ttsUrl = "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q="

async function say(args, message) {

    if (!args.length) {
        return message.channel.send(`⚠ **Usage**: \`${prefix}say "message"\``);
    } else if (message.member.voice.channel == undefined) {
        return message.channel.send("**⚠ You must be in a voice channel to use this command!**");
    }

    // Join channel
    const connection = await message.member.voice.channel.join();

    // Format the message
    let msg = args.join("+");

    // Play the TTS message
    connection.play(ttsUrl + msg);
}