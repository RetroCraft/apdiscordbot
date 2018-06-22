exports.command = 'sql <query...>';
exports.aliases = [];
exports.desc = 'Perform a SQL query (jam only)';
exports.builder = {};
exports.handler = async (args) => {
  if (args.msg.author.id !== '58009914466902016') {
    args.msg.channel.send("You're not jam. Go away. Bad child. xkcd#838");
    return;
  }
  try {
    const res = await args.db.query(args.query.join(' '));
    args.msg.channel.send(`Result: \`\`\`json\n${JSON.stringify(res)}\`\`\``);
  } catch (e) {
    args.msg.channel.send(`Oops: ${e}`);
  }
};
