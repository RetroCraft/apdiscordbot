const axios = require('axios');
const Discord = require('discord.js');

const sendComic = comicData =>
  new Discord.RichEmbed()
    .setTitle(`${comicData.num}: ${comicData.safe_title}`)
    .setAuthor('xkcd', 'https://xkcd.com/s/0b7742.png')
    .setImage(comicData.img)
    .setFooter(comicData.alt);

const loadComic = num =>
  axios
    .get(`http://xkcd.com/${num}/info.0.json`)
    .then(res => ({ embed: sendComic(res.data) }))
    .catch(() => {
      console.error(`[xkcd] failed finding comic ${num}`);
      return `Cannot find xkcd comic ${num}`;
    });

module.exports = async (args, msg) => {
  if (+args._[1]) {
    msg.channel.send(await loadComic(args._[1]));
  } else if (args._[1] === 'random') {
    axios.get('http://xkcd.com/info.0.json').then(async (res) => {
      const max = res.data.num;
      const random = Math.floor(Math.random() * max) + 1;
      msg.channel.send(await loadComic(random));
    });
  } else {
    axios
      .get('http://xkcd.com/info.0.json')
      .then((res) => {
        msg.channel.send({ embed: sendComic(res.data) });
      })
      .catch(() => {
        console.error('[xkcd] failed to load current xkcd commic');
      });
  }
};
