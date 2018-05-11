const Discord = require('discord.js');
const _ = require('lodash');
const minimist = require('minimist');

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
  if (msg.content.startsWith('ap ')) {
    const args = msg.content.substring(3).split(' ');
    const command = commands[args[0]];
    if (command) command.action(minimist(args, command.args), msg);
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

client.login(process.env.BOT_TOKEN);
