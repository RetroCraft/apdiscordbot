const axios = require('axios');
const Discord = require('discord.js');
const settings = require('./settings.json');

const client = new Discord.Client();

client.on('ready', () => {
  console.log('connected');
});

client.on('message', (msg) => {
  if (msg.content.startsWith(':')) {
    console.log(msg.content);
    const args = msg.content.substring(1).split(' ');
    if (args[0] === 'xkcd') {
      if (+args[1]) {
        axios
          .get(`http://xkcd.com/${args[1]}/info.0.json`)
          .then((res) => {
            msg.channel.send(`**xkcd ${res.data.num}: ${res.data.safe_title}**`, {
              file: res.data.img,
            });
          })
          .catch(() => {
            msg.channel.send(`Cannot find xkcd comic ${args[1]}`);
          });
      } else if (args[1] === 'latest') {
        axios
          .get('http://xkcd.com/info.0.json')
          .then((res) => {
            msg.channel.send(`**xkcd ${res.data.num}: ${res.data.safe_title}**`, {
              file: res.data.img,
            });
          })
          .catch((err) => {
            console.error('Failed to load current xkcd commic', err);
          });
      }
    }
  }
});

client.login(settings.secret);
