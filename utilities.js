const Filter = require('bad-words');
const _ = require('lodash');
const yargs = require('yargs/yargs');

const parser = yargs()
  .usage('!ap <command>')
  .version()
  .commandDir('commands')
  .demand(1)
  .strict()
  .wrap(null)
  .help();

exports.version = require('./package.json').version;

exports.runCommand = (command, context) => {
  const args = command
    .match(/[^" ]+|"(?:\\"|[^"])+"/g)
    .map((arg) => {
      const first = [...arg].findIndex(char => char !== '"');
      const last = [...arg].reverse().findIndex(char => char !== '"');
      return arg.substring(first, arg.length - last);
    })
    .slice(1);
  // console.log(args);
  parser.parse(args, context, (err, argv, output) => {
    if (output) {
      argv.msg.channel.send(output.replace(/index\.js/g, global.prefix));
    }
  });
};

exports.findUser = (user, channel) => {
  // perform id search
  const id = /<@!?(\d+)>/.exec(user);
  if (id && +id[1]) {
    const idSearch = channel.client.users.get(id[1]);
    if (idSearch) return idSearch;
  }
  // perform nickname/username search
  const { guild } = channel;
  if (guild) {
    const nickSearch = guild.members.find(
      test => test.displayName.toLowerCase() === user.toLowerCase(),
    );
    if (nickSearch) return nickSearch.user;
  }
  const nameSearch = channel.client.users.find(
    test => test.username.toLowerCase() === user.toLowerCase(),
  );
  if (nameSearch) return nameSearch;
  return null;
};

exports.findUsers = (users, channel) => {
  const found = [];
  let failed;
  _.forEach(users, (user) => {
    const data = exports.findUser(user, channel);
    if (!data) {
      failed = user;
      return false;
    }
    return found.push(data);
  });
  if (failed) {
    return channel.send(`Failed to find ${failed}`);
  }
  return found;
};

const swears = new Filter({ exclude: ['space', 'analyze'] });
exports.swearCheck = word => swears.isProfaneLike(word);
