const Discord = require('discord.js');
const _ = require('lodash');

const { db, Swears, Karma } = require('./sequelize');
const Utilities = require('./utilities');

global.prefix = '!hawk';

const client = new Discord.Client();
let responses = {};

client.on('ready', async () => {
  try {
    await db.authenticate();
  } catch (e) {
    console.error(`[bot] Error connecting to database: ${e}`);
  }

  responses = [];
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
    Utilities.runCommand(msg.content, { msg });
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
        const record = await Swears.findById(msg.author.id);
        await record.increment('swears', { by: foundSwears });
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
    const func = reaction.emoji.name === 'downvote' ? 'decrement' : 'increment';
    const record = await Karma.findById(reaction.message.author.id);
    await record[func]('karma', {
      by: 1,
    });
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
    const func = reaction.emoji.name === 'downvote' ? 'increment' : 'decrement';
    const record = await Karma.findById(reaction.message.author.id);
    await record[func]('karma', {
      by: 1,
    });
  } catch (e) {
    console.log(`[karma/remove] Error: ${e}`);
  }
});

client.login(process.env.BOT_TOKEN);
