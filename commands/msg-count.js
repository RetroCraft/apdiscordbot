const Discord = require('discord.js');
const _ = require('lodash');

module.exports = (args, msg) => {
  let { channel } = msg;
  if (args[1]) {
    const referenced = msg.guild.channels.find(c => c.name === args[1].replace('#', ''));
    if (referenced) channel = referenced;
  }
  channel.fetchMessages({ limit: 100 }).then((messages) => {
    console.log(`[msgcount] found ${messages.size} messages for #${channel.name}`);
    const stats = {};
    messages.forEach((message) => {
      const name = message.member.nickname || message.author.username;
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
  });
};
