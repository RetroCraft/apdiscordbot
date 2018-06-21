const Utilities = require('../../utilities');

exports.command = 'test <word>';
exports.aliases = ['t'];
exports.desc = 'Test if a word matches the swear filter (will still add to score)';
exports.builder = {};
exports.handler = (args) => {
  args.msg.react(Utilities.swearCheck(args.word) ? '✔' : '❌');
};
