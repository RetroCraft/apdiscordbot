const Discord = require('discord.js');
const _ = require('lodash');
const pg = require('pg');

const Utilities = require('./utilities');

global.prefix = '!ap';

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

const client = new Discord.Client();
let responses = {};

client.on('ready', async () => {
  try {
    await db.connect();
  } catch (e) {
    console.error(`[bot] Error connecting to database: ${e}`);
  }

  const noU = client.emojis.find(emoji => emoji.name === 'noU');
  responses = [
    { pattern: /^(yo)?u'?re? m[ou]m g[ae]y$/i, out: 'your mom bigger gay' },
    { pattern: /^(yo)?u'?re? m[ou]m big(ger)? g[ae]y$/i, out: 'your mom biggest gay' },
    { pattern: /^(yo)?u'?re? m[ou]m biggest? g[ae]y$/i, out: noU.toString() },
    { pattern: /^(no ?(u|you)|nay thee)$/i, out: noU.toString() },
    { pattern: `^${noU}$`, out: noU.toString() },
  ];
  try {
    await client.user.setActivity(`${global.prefix} help | ${Utilities.version}`);
  } catch (e) {
    console.error(`[bot] Error setting activity: ${e}`);
  }
  console.log('[bot] ready');
});

client.on('message', async (msg) => {
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
  // swear counter
  if (msg.channel.name !== 'spam') {
    const words = msg.content.split(/\s/);
    let foundSwears = 0;

    words.forEach((word) => {
      if (Utilities.swearCheck(word)) {
        foundSwears += 1;
      }
    });
    if (foundSwears === 0 && Utilities.swearCheck(words.join(''))) foundSwears = 1;
    if (foundSwears > 0) {
      try {
        db.query(
          `INSERT INTO swears as s (user_id, swears) VALUES ($1, $2)
        ON CONFLICT (user_id) DO UPDATE
        SET swears = s.swears + $2`,
          [msg.author.id, foundSwears],
        );
      } catch (e) {
        console.log(`[swear/catch] Error: ${e}`);
      }
    }
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
  // only handle non-meta, non-studying
  if (reaction.message.channel.name === 'meta') return;
  if (reaction.message.channel.parent && reaction.message.channel.parent.name === 'School') return;
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
  // only handle non-meta, non-studying
  if (reaction.message.channel.name === 'meta') return;
  if (reaction.message.channel.parent && reaction.message.channel.parent.name === 'school') return;
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
