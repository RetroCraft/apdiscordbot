const Discord = require('discord.js');
const _ = require('lodash');
const yargs = require('yargs/yargs');

const client = new Discord.Client();
const parser = yargs()
  .usage('ap <command>')
  .version('0.0.1')
  .commandDir('commands')
  .demand(1)
  .strict()
  .help();

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
  if (msg.author.id === client.user.id) return;
  if (msg.content.startsWith('ap ')) {
    const args = msg.content.substring(3).split(' ');
    parser.parse(args, { msg }, (err, argv, output) => {
      if (output) {
        argv.msg.channel.send(output);
      }
    });
  }
  // joke responses
  if (msg.channel.name !== 'meta') {
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
