require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const { REST, Routes } = require('discord.js');

const commands = [
  {
    name: 'kick',
    description: 'Kick a member',
    options: [
      {
        name: 'user',
        description: 'User to kick',
        type: 6,
        required: true
      },
      {
        name: 'reason',
        description: 'Reason for kick',
        type: 3,
        required: false
      }
    ]
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
        '1429871186157895693'
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
