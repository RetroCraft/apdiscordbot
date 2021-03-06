const moment = require('moment');

const Utilities = require('../utilities');

const runningCountdowns = {};

const parseTime = (time, tomorrow) => {
  const now = Date.now();
  if (+time) {
    const duration = time * 1000;
    return now + duration;
  } if (moment(time, 'HH:mm:ss').isValid()) {
    const timestamp = moment(time, 'HH:mm:ss');
    if (+timestamp < now) {
      if (!tomorrow) return 'That time has already passed...pass --tomorrow to allow rescheduling';
      const delayed = timestamp.add(1, 'day');
      return +delayed;
    }
    return +timestamp;
  }
  return "I don't understand that time...try a number of seconds (i.e. 10) or a time (i.e. 12:30)";
};

exports.command = 'countdown <time> [message]';
exports.desc = 'Set a countdown to <time> seconds or at 24-hour <time>';
exports.builder = {
  tomorrow: {
    alias: 't',
    description: 'If time has already passed, set for the same time tomorrow',
    type: 'boolean',
  },
  everyone: {
    alias: 'e',
    description: 'Ping everyone when countdown has passed',
    type: 'boolean',
  },
};
exports.handler = (args) => {
  if (args.time === 'cancel') {
    const countdown = runningCountdowns[`${args.msg.author}${args.msg.channel}`];
    if (countdown) {
      clearInterval(countdown.repeat);
      countdown.timerMessage.delete();
      delete runningCountdowns[`${args.msg.author}${args.msg.channel}`];
      args.msg.channel.send('Countdown cancelled');
    } else {
      args.msg.channel.send("You don't have any active countdowns in this channel...");
    }
  } else {
    let timerMessage;
    const timeEnd = parseTime(args.time, args.tomorrow);
    if (typeof timeEnd === 'string') {
      args.msg.channel.send(timeEnd);
      return;
    }
    args.msg.channel
      .send(`**Countdown:** ${Math.floor((timeEnd - Date.now()) / 1000)}`)
      .then((message) => {
        timerMessage = message;
        const repeat = setInterval(() => {
          const now = Date.now();
          if (now < timeEnd) {
            const timeLeft = timeEnd - now;
            timerMessage.edit(`**Countdown:** ${Math.ceil(timeLeft / 1000)}`);
          } else {
            clearInterval(repeat);
            timerMessage.delete();
            const mention = args.everyone ? '@everyone' : args.msg.author;
            const notif = args.message ? args.message : 'Your countdown has finished!';
            console.log(notif);
            args.msg.channel.send(`${mention}: ${notif}`);
            if (notif.startsWith(global.prefix)) {
              Utilities.runCommand(notif, { msg: args.msg });
            }
          }
        }, 2000);
        runningCountdowns[`${args.msg.author}${args.msg.channel}`] = { repeat, timerMessage };
      });
  }
};
