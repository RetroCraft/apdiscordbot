const axios = require('axios');
const Discord = require('discord.js');
const xkcd = require('relevant-xkcd');

const sendComic = comicData => new Discord.RichEmbed()
  .setTitle(`${comicData.id}: ${comicData.safeTitle}`)
  .setAuthor('xkcd', 'https://xkcd.com/s/0b7742.png')
  .setImage(comicData.imageURL)
  .setFooter(comicData.altText);

exports.command = 'xkcd [num]';
exports.desc = 'Show the xkcd comic #[num]. [num] may be "random" for a random comic.';
exports.builder = {};
exports.handler = async (args) => {
  if (+args.num) {
    xkcd.fetchComic(args.num).then(async comic => args.msg.channel.send(sendComic(comic)));
  } else if (args.num === 'random') {
    xkcd.fetchRandom().then(async (res) => {
      args.msg.channel.send(sendComic(res));
    });
  } else if (args.num) {
    // args.num is not emptystring or null
    xkcd.fetchAllRelevant(args.num).then(async (res) => {
      const totalComics = res.length;
      let currComic = 0;
      const comicMsg = await args.msg.channel.send(sendComic(res[currComic]));
      await comicMsg.react('▶');

      const collector = comicMsg.createReactionCollector(
        (reaction, user) => reaction.emoji.name === '▶' && user.id !== comicMsg.client.user.id,
      );
      collector.on('collect', async () => {
        const nextComic = currComic + 1;
        if (totalComics > nextComic) currComic = nextComic;
        await comicMsg.edit('', sendComic(res[currComic]));
        await comicMsg.clearReactions();
        await comicMsg.react('▶');
      });
    });
  } else {
    xkcd.fetchCurrent().then(async (res) => {
      args.msg.channel.send(sendComic(res));
    });
  }
};
