const Discord = require('discord.js');
const _ = require('lodash');

module.exports = (args, msg) => {
  let { channel } = msg;
  if (args._[1]) {
    let referenced;
    const snowflakeTest = /<#(.+)>/.exec(args._[1]);
    if (snowflakeTest) {
      referenced = msg.guild.channels.get(snowflakeTest[1]);
    } else {
      referenced = msg.guild.channels.find(c => c.name === args._[1]);
    }
    if (referenced) channel = referenced;
  }
  channel
    .fetchMessages({ limit: 100 })
    .then((messages) => {
      const stats = {};
      messages.forEach((message) => {
        if (stats[message.author.id]) {
          stats[message.author.id] += 1;
        } else {
          stats[message.author.id] = 1;
        }
      });
      const sorted = _.sortBy(
        _.map(_.keys(stats), id => ({ id, num: stats[id] })),
        'num',
      ).reverse();
      const body = `${sorted.map(user => `**<@${user.id}>**: ${user.num}`).join('\n')}`;
      msg.channel.send(new Discord.RichEmbed()
        .setAuthor('Channel Stats')
        .addField(`**User activity of the last 100 messages in #${channel.name}:**`, body));
    })
    .catch(() => console.error(`[msgcount] failed to get messages for ${channel.name}`));
};
