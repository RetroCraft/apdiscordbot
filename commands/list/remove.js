const _ = require('lodash');
const Utilities = require('../../utilities');

exports.command = 'remove <list> [users...]';
exports.aliases = ['-', 'r', 'rm'];
exports.desc = 'Remove users from list (use nickname, username, or escaped mention)';
exports.builder = {
  all: {
    alias: 'a',
    description: 'Remove all users (i.e. delete list)',
    type: 'boolean',
  },
};

exports.handler = async (args) => {
  if (!args.all) {
    // find users
    const users = Utilities.findUsers(args.users, args.msg.channel);

    // loop through specified users
    let failed = false;
    await Promise.all(_.map(users, async (user) => {
      try {
        await args.db.query('DELETE FROM lists WHERE user_id = $1 AND list = $2', [
          user.id,
          args.list,
        ]);
      } catch (e) {
        args.msg.channel.send(`Failed to remove ${user.username} from list :(`);
        console.error(`[list/remove] Error: ${e}`);
        failed = true;
        return false;
      }
      return true;
    }));
    if (failed) return;

    args.msg.channel.send(`Removed ${_.map(users, 'username').join(', ')} from ${args.list}`);
  } else {
    try {
      await args.db.query('DELETE FROM lists WHERE list = $1', [args.list]);
    } catch (e) {
      args.msg.channel.send('Failed to clear list :(');
      console.error(`[list/remove] Error: ${e}`);
      return;
    }
    args.msg.channel.send(`Removed everyone from ${args.list}`);
  }
};
