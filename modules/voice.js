const Discord = require("discord.js");
const config = require("../config.json");
const prefix = config.prefix;

const queues = {};
const dispatchers = {};
const volume = {};

module.exports = {
    queues: queues,
    dispatchers: dispatchers,
    queue_add: queue_add,
    queue_dispatch: queue_dispatch,
    pause: pause,
    resume: resume,
    volume: setVolume,
    skip: skip,
    queue: view_queue,
}

// Import module functions
const say = require('./say')
const play = require('./play')

function queue_add(message, item) {
    const vcID = message.member.voice.channel.id;
    if (!queues[vcID]) {
        queues[vcID] = [item];
        queue_dispatch(vcID, message);
        message.channel.send(`✅ **Now playing!**`);
    } else {
        queues[vcID].push(item)
        message.channel.send(`✅ **Added to queue!**`);
    }
}

async function queue_dispatch(vcID, message) {
    
    // Join channel
    const connection = await message.member.voice.channel.join();

    connection.on("disconnect", () => {
        console.log("Left")
        delete queues[vcID];
        delete dispatcher[vcID];
    })

    // Get first item in queue
    const item = queues[vcID].shift();

    // Call the corresponding function
    let dispatcher;
    switch (item.type) {
        case "play":
            dispatcher = await play.queue_play(vcID, connection, item.value, volume[vcID])
            if (!dispatcher) {
                return message.channel.send('**⚠ Invalid URL**');;
            }
            break;
        case "say":
            dispatcher = say.queue_say(vcID, connection, item.value, volume[vcID])
            break;
    }

    // Check if there is more item on queue on finish
    dispatcher.on('finish', () => {
        if (queues[vcID][0]) {
            queue_dispatch(vcID, message);
        } else {
            delete queues[vcID];
            delete dispatchers[vcID];
        }
    });

    // Error handler
    dispatcher.on('error', () => {
        message.channel.send("**⚠ Oh no! Something went wrong.**");
    });

}

function skip(args, message) {

    if (message.member.voice.channel == undefined) {
        return message.channel.send("**⚠ You must be in a voice channel to use this command!**");
    }

    const vcID = message.member.voice.channel.id;

    if (!dispatchers[vcID] || !queues[vcID]) {
        return message.channel.send("**⚠ There is nothing to skip right now!**"); 
    }

    // Play next in queue
    if (queues[vcID][0]) {
        queue_dispatch(vcID, message)
    } else {
        dispatchers[vcID].end();
        delete queues[vcID];
        delete dispatchers[vcID];
        return message.channel.send("**⏭ Skipped! Nothing in queue now.**");
    }

    return message.channel.send("**⏭ Skipped!**");
}

function pause(args, message) {

    if (message.member.voice.channel == undefined) {
        return message.channel.send("**⚠ You must be in a voice channel to use this command!**");
    }

    // Get dispatcher and pause
    const vcID = message.member.voice.channel.id;

    if (!dispatchers[vcID]) {
        return message.channel.send("**⚠ There is nothing to pause right now!**"); 
    }
    
    dispatchers[vcID].pause();
    
    return message.channel.send("**⏸ Paused!**");

}

function resume(args, message) {

    if (message.member.voice.channel == undefined) {
        return message.channel.send("**⚠ You must be in a voice channel to use this command!**");
    }

    // Get dispatcher and resume
    const vcID = message.member.voice.channel.id;

    if (!dispatchers[vcID]) {
        return message.channel.send("**⚠ There is nothing to resume right now!**"); 
    }
    
    dispatchers[vcID].resume();
    
    return message.channel.send("**▶ Resumed!**");
}

function setVolume(args, message) {

    // Usage and error checking
    if (args.length != 1) {
        return message.channel.send(`⚠ **Usage**: \`${prefix}volume value\``);
    } else if (message.member.voice.channel == undefined) {
        return message.channel.send("**⚠ You must be in a voice channel to use this command!**");
    } else if (args[0] < 0 || args[0] > 1) {
        return message.channel.send('⚠ **Value must between 0 and 1 inclusive!**');
    } 

    const vcID = message.member.voice.channel.id;

    // Change stored volume
    volume[vcID] = args[0];
    if (args[0] == 1) {
        delete volume[vcID];
    }

    // Change volume of dispatcher in real-time.
    if (dispatchers[vcID]) {
        dispatchers[vcID].setVolume(args[0]);
    }

    return message.channel.send(`✅ **Volume set to ${Math.round(args[0] * 100)}%!**`);
}


function view_queue(args, message) {

    if (message.member.voice.channel == undefined) {
        return message.channel.send("**⚠ You must be in a voice channel to use this command!**");
    }

    // Get dispatcher and resume
    const vcID = message.member.voice.channel.id;

    if (!queues[vcID] || queues[vcID] == []) {
        return message.channel.send("**⚠ Queue is empty!**"); 
    }

    // Create the result embed
    const embed = new Discord.MessageEmbed().setTitle(`**🔜 Queue 🔜**`);

    for (i = 0; i < queues[vcID].length; i++) {
        embed.addField(`${queues[vcID][i].type}`, `${i}. ${queues[vcID][i].value}`);
    }

    return message.channel.send(embed); 
}