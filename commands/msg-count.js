const Discord = require('discord.js');
const _ = require('lodash');

exports.command = 'msgcount [channel]';
exports.desc = 'Count the last 100 messages in [channel]';
exports.builder = {
  mention: {
    alias: 'm',
    description: '@mention everyone who shows up as a result',
  },
  quiet: {
    alias: 'q',
    description: 'Supress default msgcount box',
  },
};
exports.handler = (args) => {
  let { channel } = args.msg;
  if (args.channel) {
    let referenced;
    const snowflakeTest = /<#(.+)>/.exec(args.channel);
    if (snowflakeTest) {
      referenced = args.msg.guild.channels.get(snowflakeTest[1]);
    } else {
      referenced = args.msg.guild.channels.find(c => c.name === args.channel);
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
      if (!args.quiet) {
        const body = `${sorted.map(user => `**<@${user.id}>**: ${user.num}`).join('\n')}`;
        args.msg.channel.send(new Discord.RichEmbed()
          .setAuthor('Channel Stats')
          .addField(`**User activity of the last 100 messages in #${channel.name}:**`, body));
      }
      if (args.mention) {
        args.msg.channel.send(sorted.map(user => `<@${user.id}>`).join(', '));
      }
    })
    .catch(() => console.error(`[msgcount] failed to get messages for ${channel.name}`));
};
