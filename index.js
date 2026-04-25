const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  PermissionsBitField
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});
const warns = new Map();
const commands = [
  {
    name: 'kick',
    description: 'Kick a user',
    options: [
      { name: 'user', description: 'User', type: 6, required: true },
      { name: 'reason', description: 'Reason', type: 3, required: false }
    ]
  },
  {
    name: 'ban',
    description: 'Ban a user',
    options: [
      { name: 'user', description: 'User', type: 6, required: true },
      { name: 'reason', description: 'Reason', type: 3, required: false }
    ]
  },
  {
    name: 'warn',
    description: 'Warn a user',
    options: [
      { name: 'user', description: 'User', type: 6, required: true },
      { name: 'reason', description: 'Reason', type: 3, required: false }
    ]
  },
  {
    name: 'warnings',
    description: 'View warnings',
    options: [
      { name: 'user', description: 'User', type: 6, required: true }
    ]
  },
  {
    name: 'purge',
    description: 'Delete messages',
    options: [
      { name: 'amount', description: 'Amount', type: 4, required: true }
    ]
  },
  {
    name: 'timeout',
    description: 'Timeout a user',
    options: [
      { name: 'user', description: 'User', type: 6, required: true },
      { name: 'time', description: 'Seconds', type: 4, required: true }
    ]
  },
  {
    name: 'serverinfo',
    description: 'Server info'
  },
  {
    name: 'userinfo',
    description: 'User info',
    options: [
      { name: 'user', description: 'User', type: 6, required: true }
    ]
  },
  {
    name: 'about',
    description: 'About the bot'
  },
  {
    name: 'roleadd',
    description: 'Add a role',
    options: [
      { name: 'user', description: 'User', type: 6, required: true },
      { name: 'role', description: 'Role', type: 8, required: true }
    ]
  },
  {
    name: 'roleremove',
    description: 'Remove a role',
    options: [
      { name: 'user', description: 'User', type: 6, required: true },
      { name: 'role', description: 'Role', type: 8, required: true }
    ]
  }
];
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );
    console.log('Commands registered');
  } catch (err) {
    console.error(err);
  }
});
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {

    if (commandName === 'serverinfo') {
  const { guild } = interaction;

  const embed = {
    color: 0x2b2d31,
    title: ` ${guild.name}`,
    thumbnail: { url: guild.iconURL() },
    fields: [
      { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
      { name: 'Members', value: `${guild.memberCount}`, inline: true },
      { name: 'Server ID', value: guild.id, inline: false },
      { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: false }
    ]
  };

  await interaction.reply({ embeds: [embed] });
    }
    
if (commandName === 'kick') {
  const user = interaction.options.getUser('user');
  const member = await interaction.guild.members.fetch(user.id);
  await member.kick();
  return interaction.reply(`Kicked ${user.tag}`);
}

if (commandName === 'ban') {
  const user = interaction.options.getUser('user');
  const member = await interaction.guild.members.fetch(user.id);
  await member.ban();
  return interaction.reply(`Banned ${user.tag}`);
}

if (commandName === 'warn') {
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'No reason';

  if (!warns.has(user.id)) warns.set(user.id, []);
  warns.get(user.id).push(reason);

  return interaction.reply(`${user.tag} warned`);
}

if (commandName === 'warnings') {
  const user = interaction.options.getUser('user');
  const list = warns.get(user.id) || [];

  return interaction.reply(
    `${user.tag} warnings:\n${list.length ? list.join('\n') : 'None'}`
  );
}
    if (commandName === 'purge') {
  const amount = interaction.options.getInteger('amount');
  await interaction.channel.bulkDelete(amount, true);
  return interaction.reply(`Deleted ${amount} messages`);
}

if (commandName === 'timeout') {
  const user = interaction.options.getUser('user');
  const time = interaction.options.getInteger('time');

  const member = await interaction.guild.members.fetch(user.id);
  await member.timeout(time * 1000);

  return interaction.reply(`${user.tag} timed out`);
}
    if (commandName === 'serverinfo') {
  return interaction.reply(`Server: ${interaction.guild.name}`);
}

if (commandName === 'userinfo') {
  const user = interaction.options.getUser('user');
  const member = await interaction.guild.members.fetch(user.id);

  const embed = {
    color: 0x2b2d31,
    title: ` ${user.tag}`,
    thumbnail: { url: user.displayAvatarURL() },
    fields: [
      { name: 'User ID', value: user.id, inline: false },
      { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
      { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
      { name: 'Roles', value: member.roles.cache.map(r => r.name).join(', '), inline: false }
    ]
  };

  await interaction.reply({ embeds: [embed] });
}

if (commandName === 'about') {
  const embed = {
    color: 0x2b2d31,
    title: ' About This Bot',
    description: 'A powerful moderation bot designed to manage your server efficiently.',
    fields: [
      { name: ' Features', value: 'Kick, Ban, Warn, Roles, Timeout, Info', inline: false },
      { name: ' Status', value: 'Online & Running', inline: true },
      { name: ' Developer', value: '1345041788804534343', inline: true }
    ]
  };

  await interaction.reply({ embeds: [embed] });
}
    if (commandName === 'roleadd') {
  const user = interaction.options.getUser('user');
  const role = interaction.options.getRole('role');

  const member = await interaction.guild.members.fetch(user.id);
  await member.roles.add(role);

  return interaction.reply(`Added role to ${user.tag}`);
}

if (commandName === 'roleremove') {
  const user = interaction.options.getUser('user');
  const role = interaction.options.getRole('role');

  const member = await interaction.guild.members.fetch(user.id);
  await member.roles.remove(role);

  return interaction.reply(`Removed role from ${user.tag}`);
}
    } catch (err) {
    console.error(err);
    interaction.reply({ content: 'Error occurred', ephemeral: true });
  }
});
client.login(process.env.TOKEN);
