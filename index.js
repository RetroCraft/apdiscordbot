const Discord = require('discord.js');
const _ = require('lodash');
const pg = require('pg');

const Utilities = require('./utilities');

global.prefix = '!ap';

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

db.connect();

const client = new Discord.Client();
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
  client.user.setActivity(`${global.prefix} help`);
});

client.on('message', (msg) => {
  if (msg.author.id === client.user.id) return;
  if (msg.content.startsWith(global.prefix)) {
    Utilities.runCommand(msg.content, { msg, db });
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
