const axios = require('axios');
const Discord = require('discord.js');

const sendComic = comicData => new Discord.RichEmbed()
  .setTitle(`${comicData.num}: ${comicData.safe_title}`)
  .setAuthor('xkcd', 'https://xkcd.com/s/0b7742.png')
  .setImage(comicData.img)
  .setFooter(comicData.alt);

const loadComic = num => axios
  .get(`http://xkcd.com/${num}/info.0.json`)
  .then(res => ({ embed: sendComic(res.data) }))
  .catch(() => {
    console.error(`[xkcd] failed finding comic ${num}`);
    return `Cannot find xkcd comic ${num}`;
  });

exports.command = 'xkcd [num]';
exports.desc = 'Show the xkcd comic #[num]. [num] may be "random" for a random comic.';
exports.builder = {};
exports.handler = async (args) => {
  if (+args.num) {
    args.msg.channel.send(await loadComic(args.num));
  } else if (args.num === 'random') {
    axios.get('http://xkcd.com/info.0.json').then(async (res) => {
      const max = res.data.num;
      const random = Math.floor(Math.random() * max) + 1;
      args.msg.channel.send(await loadComic(random));
    });
  } else {
    axios
      .get('http://xkcd.com/info.0.json')
      .then((res) => {
        args.msg.channel.send({ embed: sendComic(res.data) });
      })
      .catch(() => {
        console.error('[xkcd] failed to load current xkcd commic');
      });
  }
};
