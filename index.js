const Discord = require('discord.js');
const _ = require('lodash');
const settings = require('./settings.json');

const xkcd = require('./commands/xkcd');
const msgcount = require('./commands/msg-count');
const countdown = require('./commands/countdown');

const client = new Discord.Client();

const commands = {
  xkcd,
  msgcount,
  countdown,
};

let responses = {};

client.on('ready', () => {
  console.log('[bot] connected');
  const noU = client.emojis.find('name', 'noU');
  responses = [
    { pattern: /^(yo)?u'?re? m[ou]m g[ae]y$/i, out: 'your mom bigger gay' },
    { pattern: /^(yo)?u'?re? m[ou]m big(ger)? g[ae]y$/i, out: 'your mom biggest gay' },
    { pattern: /^(yo)?u'?re? m[ou]m biggest? g[ae]y$/i, out: noU.toString() },
    { pattern: /^(no ?(u|you)|nay thee)$/i, out: noU.toString() },
    { pattern: `^${noU}$`, out: noU.toString() },
  ];
});

client.on('message', (msg) => {
  if (msg.content.startsWith(':')) {
    const args = msg.content.substring(1).split(' ');
    if (commands[args[0]]) commands[args[0]](args, msg);
  }
  // joke responses
  if (msg.author.id !== client.user.id && msg.channel.name !== 'meta') {
    _.forEach(responses, (response) => {
      if (msg.content.match(response.pattern)) {
        msg.channel.send(response.out);
        return false;
      }
      return true;
    });
  }
});

client.login(settings.secret);
