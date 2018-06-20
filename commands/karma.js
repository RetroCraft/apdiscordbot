const _ = require('lodash');
const Utilities = require('../utilities');

exports.command = 'karma [user]';
exports.desc = 'Show karma for the specified user, or show a leaderboard if user is blank.';
exports.builder = {};
exports.handler = async (args) => {
  if (args.user) {
    const user = Utilities.findUser(args.user, args.msg.channel);
    if (!user) {
      args.msg.channel.send("I'm sorry, I don't recognize that user. Try an @mention or use the nickname.");
      return;
    }
    let karma;
    try {
      karma = await args.db.query('SELECT karma FROM karma WHERE user_id = $1', [user.id]);
      karma = karma.rows.length > 0 ? karma.rows[0].karma : 0;
    } catch (e) {
      args.msg.channel.send('Oops...something went wrong getting the karma score.');
      console.log(`[karma/get] Error: ${e}`);
      return;
    }
    args.msg.channel.send(`**Karma for ${user.username}:** ${karma}`);
  } else {
    let leaderboard;
    try {
      const res = await args.db.query('SELECT user_id, karma FROM karma WHERE karma != 0');
      leaderboard = res.rows;
    } catch (e) {
      args.msg.channel.send('Oops...something went wrong getting the karma score.');
      console.log(`[karma/get] Error: ${e}`);
    }
    leaderboard = _.sortBy(leaderboard, 'karma').reverse();
    const scores = await Promise.all(_.map(leaderboard, async (entry) => {
      const entryUser = await args.msg.client.fetchUser(entry.user_id);
      return `**${entryUser.username}**: ${entry.karma}`;
    }));
    args.msg.channel.send(`**Karma Leaderboard**\n${scores.join('\n')}`);
  }
};
