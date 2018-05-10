const Discord = require('discord.js');
const settings = require('./settings.json');
const xkcd = require('./xkcd');

const client = new Discord.Client();

const commands = {
  xkcd,
};

client.on('ready', () => {
  console.log('connected');
});

client.on('message', (msg) => {
  if (msg.content.startsWith(':')) {
    console.log(msg.content);
    const args = msg.content.substring(1).split(' ');
    if (commands[args[0]]) commands[args[0]](args, msg);
  }
});

client.login(settings.secret);
