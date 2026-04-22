const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});
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
        description: 'Reason',
        type: 3,
        required: false
      }
    ]
  },
  {
    name: 'ban',
    description: 'Ban a member',
    options: [
      {
        name: 'user',
        description: 'User to ban',
        type: 6,
        required: true
      },
      {
        name: 'reason',
        description: 'Reason',
        type: 3,
        required: false
      }
    ]
  },
  {
    name: 'warn',
    description: 'Warn a member',
    options: [
      {
        name: 'user',
        description: 'User to warn',
        type: 6,
        required: true
      },
      {
        name: 'reason',
        description: 'Reason',
        type: 3,
        required: false
      }
    ]
  }
];
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    console.log('Registering slash commands...');

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log('Slash commands registered successfully!');
  } catch (err) {
    console.error('Error registering commands:', err);
  }
});
client.login(process.env.TOKEN);
