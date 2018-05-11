const _ = require('lodash');

exports.findUser = (user, channel) => {
  // perform id search
  const id = /<@(\d+)>/.exec(user);
  if (id && +id[1]) {
    const idSearch = channel.client.users.get(id[1]);
    if (idSearch) return idSearch;
  }
  // perform nickname/username search
  const { guild } = channel;
  if (guild) {
    const nickSearch = guild.members.find('displayName', user);
    if (nickSearch) return nickSearch.user;
  }
  const nameSearch = channel.client.users.find('username', user);
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
