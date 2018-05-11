const moment = require('moment');

const runningCountdowns = {};

const parseTime = (time, tomorrow) => {
  const now = Date.now();
  if (+time) {
    const duration = time * 1000;
    return now + duration;
  } else if (moment(time, 'HH:mm:ss').isValid()) {
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

module.exports = {
  args: { alias: { t: 'tomorrow', e: 'everyone' } },
  action: (args, msg) => {
    if (args._[0] === 'cancel') {
      if (runningCountdowns[`${msg.author}${msg.channel}`]) {
        clearInterval(runningCountdowns[`${msg.author}${msg.channel}`]);
        delete runningCountdowns[`${msg.author}${msg.channel}`];
        msg.channel.send('Countdown cancelled');
      } else {
        msg.channel.send("You don't have any active countdowns in this channel...");
      }
    } else {
      let timerMessage;
      const timeEnd = parseTime(args._[1], args.tomorrow);
      if (typeof timeEnd === 'string') {
        msg.channel.send(timeEnd);
        return;
      }
      msg.channel
        .send(`**Countdown:** ${Math.floor((timeEnd - Date.now()) / 1000)}`)
        .then((message) => {
          timerMessage = message;
        });
      const repeat = setInterval(() => {
        const now = Date.now();
        if (now < timeEnd) {
          const timeLeft = timeEnd - now;
          timerMessage.edit(`**Countdown:** ${Math.ceil(timeLeft / 1000)}`);
        } else {
          clearInterval(repeat);
          timerMessage.delete();
          const mention = args.everyone ? '@everyone' : msg.author;
          const message = args._[2] ? args._.slice(2).join(' ') : 'Your countdown has finished!';
          msg.channel.send(`${mention}: ${message}`);
        }
      }, 2000);
      runningCountdowns[`${msg.author}${msg.channel}`] = repeat;
    }
  },
};
