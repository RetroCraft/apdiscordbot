const _ = require('lodash');

exports.command = 'show <list>';
exports.aliases = ['*', 's'];
exports.desc = 'List the members of a list';
exports.builder = {
  mention: {
    alias: 'm',
    description: 'Mention everyone in the list',
    type: 'boolean',
  },
};
exports.handler = async (args) => {
  const users = [];
  try {
    const query = await args.db.query('SELECT user_id FROM lists WHERE list = $1', [args.list]);
    if (!query.rows || query.rows.length < 1) throw new Error();
    query.rows.forEach(row => users.push(args.msg.client.users.get(row.user_id)));
  } catch (e) {
    args.msg.channel.send('Failed to get list...did you spell the list wrong? :(');
    console.error(`[list/show] Error: ${e}`);
    return;
  }
  const names = _.map(users, (user) => {
    if (args.mention) return user.toString();
    return user.username;
  }).join(', ');
  args.msg.channel.send(`**${args.list}**: ${names}`);
};
