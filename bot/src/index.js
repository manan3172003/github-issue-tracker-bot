import { Client, GatewayIntentBits, ChannelType } from 'discord.js';
import dotenv from "dotenv";
import express from 'express';


dotenv.config();

const app_emitter = express();
app_emitter.set('port', 8000);

const client = new Client({ 
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});
const GUILD_ID = process.env.DISCORD_GUILD_ID; // The ID of your Discord server (guild)
const CATEGORY_NAME = 'Active Issues'; // The name of the category under which channels will be created

client.login(process.env.CLIENT_TOKEN); // Discord bot token

app_emitter.use(express.json());

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
app_emitter.post('/createChannel', async (req, res) => {
  const { issue } = req.body;
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) return res.status(404).send('Guild not found');

  const category = guild.channels.cache.find(channel => channel.name === CATEGORY_NAME && channel.type == ChannelType.GuildCategory);
  if (!category) return res.status(404).send('Category not found');

  const channelName = `issue-${issue.number}`;
  await guild.channels.create({ name: channelName, type: ChannelType.GuildText, parent: category.id });
  console.log(`Created channel: ${channelName}`);
  res.send('Channel created');
});

app_emitter.post('/archiveChannel', async (req, res) => {
  const { issue } = req.body;
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) return res.status(404).send('Guild not found');

  const channel = guild.channels.cache.find(ch => ch.name === `issue-${issue.number}`);
  if (channel) {
    await channel.setParent(null); // Remove from category to "archive"
    console.log(`Archived channel: issue-${issue.number}`);
    res.send('Channel archived');
  } else {
    res.status(404).send('Channel not found');
  }
});

app_emitter.post('/pingUsers', async (req, res) => {
  const { issue, assignees } = req.body;
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) return res.status(404).send('Guild not found');

  const channel = guild.channels.cache.find(ch => ch.name === `issue-${issue.number}`);
  if (channel) {
    for (const assignee of assignees) {
      const member = guild.members.cache.find(m => m.user.username === assignee);
      if (member) {
        await channel.send(`Hey <@${member.id}>, you have been assigned to issue #${issue.number}`);
      }
    }
    res.send('Users pinged');
  } else {
    res.status(404).send('Channel not found');
  }
});

app_emitter.listen(app_emitter.get('port'), () => {
  console.log(`Emitter app is running on port ${app_emitter.get('port')}`);
});
