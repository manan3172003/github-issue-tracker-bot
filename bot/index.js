// const { Client, IntentsBitField } = require("discord.js");
// require("dotenv").config();

// const client = new Client({
//   intents: [
//     IntentsBitField.Flags.Guilds,
//     IntentsBitField.Flags.GuildMembers,
//     IntentsBitField.Flags.GuildMessages,
//     IntentsBitField.Flags.MessageContent,
//   ],
// });

// client.login(process.env.CLIENT_TOKEN);

// check
// 

const { MessageEmbed, WebhookClient } = require("discord.js")
require("dotenv").config()

const client = new WebhookClient({
  url: process.env.DISCORD_WEBHOOK_URL
})

client