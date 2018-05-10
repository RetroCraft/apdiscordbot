const Discord = require('discord.js');
const _ = require('lodash');

module.exports = (args, msg) => {
  let { channel } = msg;
  if (args[1]) {
    let referenced;
    const snowflakeTest = /<#(.+)>/.exec(args[1]);
    if (snowflakeTest) {
      referenced = msg.guild.channels.get(snowflakeTest[1]);
    } else {
      referenced = msg.guild.channels.find(c => c.name === args[1]);
    }
    if (referenced) channel = referenced;
  }
  channel
    .fetchMessages({ limit: 100 })
    .then((messages) => {
      const stats = {};
      messages.forEach((message) => {
        let name = message.author.username;
        if (message.member) name = message.member.nickname;
        if (stats[name]) {
          stats[name] += 1;
        } else {
          stats[name] = 1;
        }
      });
      const sorted = _.sortBy(
        _.map(_.keys(stats), name => ({ name, num: stats[name] })),
        'num',
      ).reverse();
      const body = sorted.map(user => `**${user.name}**: ${user.num}`).join('\n');
      msg.channel.send(new Discord.RichEmbed()
        .setAuthor('Channel Stats')
        .setTitle(`User activity of the last 100 messages in #${channel.name}:`)
        .setDescription(body));
    })
    .catch(() => console.error(`[msgcount] failed to get messages for ${channel.name}`));
};
