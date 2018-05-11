const Discord = require('discord.js');
const settings = require('./settings.json');

const xkcd = require('./commands/xkcd');
const msgcount = require('./commands/msg-count');

const client = new Discord.Client();

const commands = {
  xkcd,
  msgcount,
};

client.on('ready', () => {
  console.log('[bot] connected');
});

client.on('message', (msg) => {
  if (msg.content.startsWith(':')) {
    const args = msg.content.substring(1).split(' ');
    if (commands[args[0]]) commands[args[0]](args, msg);
  }
  // no u
  if (msg.author.id !== client.user.id) {
    const noU = client.emojis.find('name', 'noU');
    const noURegex = /^((yo)?u'?re? m[ou]m (big)? g[ae]y)|(no ?(u|you))[.! ]*$/i;
    if (noURegex.exec(msg.content) || msg.content.includes(noU.toString())) {
      msg.channel.send(`${client.emojis.find('name', 'noU')}`);
    }
  }
});

client.login(settings.secret);
