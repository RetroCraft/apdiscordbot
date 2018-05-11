module.exports = (args, msg) => {
  const time = +args[1] * 1000;
  const timeStart = new Date().getTime();
  const timeEnd = timeStart + time;
  if (!time) {
    msg.channel.send("I don't understand that time, sorry");
    return;
  }
  let timerMessage;
  msg.channel.send(`**Countdown:** ${Math.floor(time / 1000)}`).then((message) => {
    timerMessage = message;
  });
  const repeat = setInterval(() => {
    const now = new Date().getTime();
    if (now < timeEnd) {
      const timeLeft = timeEnd - now;
      timerMessage.edit(`**Countdown:** ${Math.ceil(timeLeft / 1000)}`);
    } else {
      clearInterval(repeat);
      timerMessage.delete();
      msg.channel.send(`${msg.author} your countdown has finished!`);
    }
  }, 2000);
};
