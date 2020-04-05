const queues = {};
const dispatchers = {};

module.exports = {
    queues: queues,
    dispatchers: dispatchers,
    queue_add: queue_add,
    queue_dispatch: queue_dispatch,
    pause: pause,
}

// Import module functions
const say = require('./say')
const play = require('./play')

/*  
 * Add item to the channel's queue
 * item = {type: "", value: ""}
 */
function queue_add(message, item) {
    const vcID = message.member.voice.channel.id;
    if (!queues[vcID]) {
        queues[vcID] = [item];
        queue_dispatch(vcID, message);
    } else {
        queues[vcID].push(item)
    }
}

/*
 * Dispatch items in queue to the corresponding function
 */
async function queue_dispatch(vcID, message) {

    // Join channel
    const connection = await message.member.voice.channel.join();

    // Get first item in queue
    const item = queues[vcID].shift();

    // Call the corresponding function
    let dispatcher;
    switch (item.type) {
        case "play":
            dispatcher = await play.queue_play(vcID, connection, item.value)
            if (!dispatcher) {
                return message.channel.send('**⚠ Invalid URL**');;
            }
            break;
        case "say":
            dispatcher = say.queue_say(vcID, connection, item.value)
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

function pause(args, message) {

    // Get dispatcher and pause
    const vcID = message.member.voice.channel.id;

    if (!dispatchers[vcID]) {
        return message.channel.send("**⚠ There is nothing to pause right now!**"); 
    }
    
    dispatchers[vcID].pause();
    
    return message.channel.send("**✅ Paused!**");

}

function setVolume(args, message) {

    // Usage and error checking
    if (args.length != 1) {
        return message.channel.send(`⚠ **Usage**: \`${prefix}volume value\``);
    } else if (args[0] < 0 || args[0] > 1) {
        return message.channel.send('⚠ **Value must between 0 and 1 inclusive!**');
    }

    // Change volume
    volume = args[0];
    return message.channel.send(`✅ **Volume set to '${volume}'. New volume will apply on next '${prefix}play'.**`);
}