const Discord = require('discord.js');
const settings = require('./settings.json');

const client = new Discord.Client();

client.on('ready', () => {
  console.log('connected');
});

client.login(settings.secret);
