const moment = require('moment');

const runningCountdowns = {};

const parseTime = (time) => {
  if (+time) {
    const timeStart = Date.now();
    const duration = time * 1000;
    return timeStart + duration;
  } else if (moment(time, 'HH:mm:ss').isValid()) {
    return +moment(time, 'HH:mm:ss');
  }
  return null;
};

module.exports = (args, msg) => {
  if (args[1] === 'cancel') {
    if (runningCountdowns[`${msg.author}${msg.channel}`]) {
      clearInterval(runningCountdowns[`${msg.author}${msg.channel}`]);
      delete runningCountdowns[`${msg.author}${msg.channel}`];
      msg.channel.send('Countdown cancelled');
    } else {
      msg.channel.send("You don't have any active countdowns in this channel...");
    }
  } else {
    let timerMessage;
    const timeEnd = parseTime(args[1]);
    if (!timeEnd) {
      msg.channel.send("I don't understand that time...try a number of seconds (i.e. 10) or a time (i.e. 12:30)");
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
        const message = args[2] ? args.slice(2).join(' ') : 'Your countdown has finished!';
        msg.channel.send(`${msg.author}: ${message}`);
      }
    }, 2000);
    runningCountdowns[`${msg.author}${msg.channel}`] = repeat;
  }
};
