const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});
const commands = [
  {
    name: 'kick',
    description: 'Kick a member',
    options: [
      { name: 'user', description: 'User to kick', type: 6, required: true },
      { name: 'reason', description: 'Reason', type: 3, required: false }
    ]
  },
  {
    name: 'ban',
    description: 'Ban a member',
    options: [
      { name: 'user', description: 'User to ban', type: 6, required: true },
      { name: 'reason', description: 'Reason', type: 3, required: false }
    ]
  },
  {
    name: 'warn',
    description: 'Warn a member',
    options: [
      { name: 'user', description: 'User to warn', type: 6, required: true },
      { name: 'reason', description: 'Reason', type: 3, required: false }
    ]
  }
];
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  await rest.put(
  Routes.applicationGuildCommands(client.user.id, 'YOUR_GUILD_ID'),
  { body: commands }
);

  console.log('Commands registered');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'kick') {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) return interaction.reply({ content: 'User not found', ephemeral: true });
    if (!member.kickable) return interaction.reply({ content: 'Cannot kick user', ephemeral: true });

    await member.kick();
    return interaction.reply(`Kicked ${user.tag}`);
  }

  if (interaction.commandName === 'ban') {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) return interaction.reply({ content: 'User not found', ephemeral: true });
    if (!member.bannable) return interaction.reply({ content: 'Cannot ban user', ephemeral: true });

    await member.ban();
    return interaction.reply(`Banned ${user.tag}`);
  }

  if (interaction.commandName === 'warn') {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      await user.send(`You have been warned in ${interaction.guild.name}\nReason: ${reason}`);
    } catch {}

    return interaction.reply(`Warned ${user.tag}\nReason: ${reason}`);
  }
});

client.login(process.env.TOKEN);
