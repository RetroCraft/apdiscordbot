const _ = require('lodash');
const Utilities = require('../utilities');

exports.command = 'swears [user]';
exports.desc = 'Show swear count for the specified user, or show a leaderboard if user is blank.';
exports.builder = {};
exports.handler = async (args) => {
  if (args.user) {
    const user = Utilities.findUser(args.user, args.msg.channel);
    if (!user) {
      args.msg.channel.send("I'm sorry, I don't recognize that user. Try an @mention or use the nickname.");
      return;
    }
    let swears;
    try {
      swears = await args.db.query('SELECT swears FROM swears WHERE user_id = $1', [user.id]);
      swears = swears.rows.length > 0 ? swears.rows[0].swears : 0;
    } catch (e) {
      args.msg.channel.send('Oops...something went wrong getting the swear count.');
      console.log(`[swears/get] Error: ${e}`);
      return;
    }
    args.msg.channel.send(`**Swears for ${user.username}:** ${swears}`);
  } else {
    let leaderboard;
    try {
      const res = await args.db.query('SELECT user_id, swears FROM swears WHERE swears != 0');
      leaderboard = res.rows;
    } catch (e) {
      args.msg.channel.send('Oops...something went wrong getting the swear count.');
      console.log(`[swears/get] Error: ${e}`);
    }
    leaderboard = _.sortBy(leaderboard, 'swears').reverse();
    const scores = await Promise.all(_.map(leaderboard, async (entry) => {
      const entryUser = await args.msg.client.fetchUser(entry.user_id);
      return `**${entryUser.username}**: ${entry.swears}`;
    }));
    args.msg.channel.send(`**Swear Leaderboard**\n${scores.join('\n')}`);
  }
};
