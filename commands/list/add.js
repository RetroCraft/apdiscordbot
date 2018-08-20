const _ = require('lodash');
const { Lists } = require('../../sequelize');
const Utilities = require('../../utilities');

exports.command = 'add <list> <users...>';
exports.aliases = ['+', 'a'];
exports.desc = 'Add users to list (use nickname, username, or escaped mention)';
exports.builder = {};

exports.handler = async (args) => {
  // find users
  const users = Utilities.findUsers(args.users, args.msg.channel);

  // loop through specified users
  let failed = false;
  await Promise.all(
    _.map(users, async (user) => {
      try {
        await Lists.create({ user_id: user.id, list: args.list });
      } catch (e) {
        args.msg.channel.send(
          `Failed to add ${user.username} to list. Maybe they're already in the list? :(`,
        );
        console.error(`[list/add] Error: ${e}`);
        failed = true;
        return false;
      }
      return true;
    }),
  );
  if (failed) return;

  args.msg.channel.send(`Added ${_.map(users, 'username').join(', ')} to ${args.list}`);
};
