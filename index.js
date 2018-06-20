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

client.on('messageReactionAdd', async (reaction, user) => {
  // only handle up/down votes
  if (reaction.emoji.name !== 'upvote' && reaction.emoji.name !== 'downvote') return;
  // don't handle apdiscordbot's votes
  if (reaction.me) return;
  // only handle public channel votes (not dms etc)
  if (reaction.message.channel.type !== 'text') return;
  // don't handle self votes
  if (reaction.message.author.id === user.id) return;
  try {
    const sign = reaction.emoji.name === 'downvote' ? '-' : '+';
    await db.query(
      `INSERT INTO karma as k (user_id, karma) VALUES ($1, ${sign}1)
      ON CONFLICT (user_id) DO UPDATE
      SET karma = k.karma ${sign} 1`,
      [reaction.message.author.id],
    );
  } catch (e) {
    console.log(`[karma/add] Error: ${e}`);
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  // only handle up/down votes
  if (reaction.emoji.name !== 'upvote' && reaction.emoji.name !== 'downvote') return;
  // don't handle apdiscordbot's votes
  if (reaction.me) return;
  // only handle public channel votes (not dms etc)
  if (reaction.message.channel.type !== 'text') return;
  // don't handle self votes
  if (reaction.message.author.id === user.id) return;
  try {
    const sign = reaction.emoji.name === 'downvote' ? '+' : '-';
    await db.query(
      `INSERT INTO karma as k (user_id, karma) VALUES ($1, ${sign}1)
      ON CONFLICT (user_id) DO UPDATE
      SET karma = k.karma ${sign} 1`,
      [reaction.message.author.id],
    );
  } catch (e) {
    console.log(`[karma/remove] Error: ${e}`);
  }
});

client.login(process.env.BOT_TOKEN);
