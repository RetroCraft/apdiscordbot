const Discord = require('discord.js');
const _ = require('lodash');
const pg = require('pg');
const yargs = require('yargs/yargs');

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

db.connect();

const client = new Discord.Client();
const parser = yargs()
  .usage('!ap <command>')
  .version('0.0.1')
  .commandDir('commands')
  .demand(1)
  .strict()
  .wrap(null)
  .help();

const prefix = '!ap';
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
  client.user.setActivity(`${prefix} help`);
});

client.on('message', (msg) => {
  if (msg.author.id === client.user.id) return;
  if (msg.content.startsWith(prefix)) {
    const args = msg.content.split(' ').slice(1);
    parser.parse(args, { db, msg }, (err, argv, output) => {
      if (output) {
        argv.msg.channel.send(output.replace(/index\.js/g, prefix));
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
