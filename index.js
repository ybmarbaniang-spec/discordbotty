require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const { REST, Routes } = require('discord.js');

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!'
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    console.log('Registering slash commands...');

    await rest.put(
      Routes.applicationGuildCommands(
        client.user.id,
        'YOUR_GUILD_ID'
      ),
      { body: commands }
    );

    console.log('Slash commands registered!');
  } catch (err) {
    console.error(err);
  }
});
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('🏓 Pong!');
  }

  if (interaction.commandName === 'ban') {
    const user = interaction.options.getUser('user');
    await interaction.reply(`🔨 Banned ${user.tag}`);
  }

  if (interaction.commandName === 'kick') {
    const user = interaction.options.getUser('user');
    await interaction.reply(`👢 Kicked ${user.tag}`);
  }

  if (interaction.commandName === 'warn') {
    const user = interaction.options.getUser('user');
    await interaction.reply(`⚠️ Warned ${user.tag}`);
  }
});

client.login(process.env.TOKEN);
