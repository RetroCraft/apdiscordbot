const Discord = require('discord.js');
const _ = require('lodash');
const { Karma, Op } = require('../sequelize');
const Utilities = require('../utilities');

exports.command = 'karma [user]';
exports.desc = 'Show karma for the specified user, or show a leaderboard if user is blank.';
exports.builder = {};
exports.handler = async (args) => {
  if (args.user) {
    const user = Utilities.findUser(args.user, args.msg.channel);
    if (!user) {
      args.msg.channel.send(
        "I'm sorry, I don't recognize that user. Try an @mention or use the nickname.",
      );
      return;
    }
    let karma;
    try {
      const record = await Karma.findById(user.id);
      karma = record ? record.karma : 0;
    } catch (e) {
      args.msg.channel.send('Oops...something went wrong getting the karma score.');
      console.log(`[karma/get] Error: ${e}`);
      return;
    }
    args.msg.channel.send(`**Karma for ${user.username}:** ${karma}`);
  } else {
    let leaderboard;
    try {
      leaderboard = await Karma.findAll({ where: { karma: { [Op.ne]: 0 } } });
    } catch (e) {
      args.msg.channel.send('Oops...something went wrong getting the karma score.');
      console.log(`[karma/get] Error: ${e}`);
    }
    leaderboard = _.sortBy(leaderboard, 'karma').reverse();
    const scores = await Promise.all(
      _.map(leaderboard, async entry => `**<@${entry.user_id}>**: ${entry.karma}`),
    );
    const body = scores.join('\n');
    args.msg.channel.send(new Discord.RichEmbed().addField('**Swear Leaderboard**', body));
  }
};
