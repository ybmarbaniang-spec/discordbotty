const {
  Client,
  GatewayIntentBits,
  REST,
  Routes
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
  { name: 'kick', description: 'Kick a user', options: [{ name: 'user', type: 6, required: true }, { name: 'reason', type: 3 }] },
  { name: 'ban', description: 'Ban a user', options: [{ name: 'user', type: 6, required: true }, { name: 'reason', type: 3 }] },
  { name: 'warn', description: 'Warn a user', options: [{ name: 'user', type: 6, required: true }, { name: 'reason', type: 3 }] },
  { name: 'warnings', description: 'View warnings', options: [{ name: 'user', type: 6, required: true }] },
  { name: 'purge', description: 'Delete messages', options: [{ name: 'amount', type: 4, required: true }] },
  { name: 'timeout', description: 'Timeout a user', options: [{ name: 'user', type: 6, required: true }, { name: 'time', type: 4, required: true }] },
  { name: 'serverinfo', description: 'Server info' },
  { name: 'userinfo', description: 'User info', options: [{ name: 'user', type: 6, required: true }] },
  { name: 'about', description: 'About bot' },
  { name: 'roleadd', description: 'Add role', options: [{ name: 'user', type: 6, required: true }, { name: 'role', type: 8, required: true }] },
  { name: 'roleremove', description: 'Remove role', options: [{ name: 'user', type: 6, required: true }, { name: 'role', type: 8, required: true }] }
];

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('Commands registered');
  } catch (err) {
    console.error(err);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {

    // KICK
    if (commandName === 'kick') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason';
      const member = await interaction.guild.members.fetch(user.id);

      await member.kick(reason);
      return interaction.reply(`Kicked ${user.tag}`);
    }

    // BAN
    if (commandName === 'ban') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason';
      const member = await interaction.guild.members.fetch(user.id);

      await member.ban({ reason });
      return interaction.reply(`Banned ${user.tag}`);
    }

    // WARN
    if (commandName === 'warn') {
      await interaction.deferReply();

      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason';

      if (!warns.has(user.id)) warns.set(user.id, []);

      warns.get(user.id).push({
        reason,
        moderator: interaction.user.tag,
        date: new Date().toLocaleString()
      });

      const total = warns.get(user.id).length;

      return interaction.editReply({
        embeds: [{
          color: 0x2b2d31,
          title: 'User Warned',
          fields: [
            { name: 'User', value: user.tag, inline: true },
            { name: 'Moderator', value: interaction.user.tag, inline: true },
            { name: 'Reason', value: reason },
            { name: 'Total Warnings', value: `${total}` }
          ]
        }]
      });
    }

    // WARNINGS
    if (commandName === 'warnings') {
      const user = interaction.options.getUser('user');
      const userWarns = warns.get(user.id) || [];

      if (!userWarns.length) {
        return interaction.reply({ content: `${user.tag} has no warnings.`, ephemeral: true });
      }

      const formatted = userWarns
        .map((w, i) => `${i + 1}. ${w.reason} (by ${w.moderator})`)
        .join('\n');

      return interaction.reply({
        content: `Warnings for ${user.tag}:\n\n${formatted}`,
        ephemeral: true
      });
    }

    // PURGE
    if (commandName === 'purge') {
      const amount = interaction.options.getInteger('amount');
      await interaction.channel.bulkDelete(amount, true);
      return interaction.reply(`Deleted ${amount} messages`);
    }

    // TIMEOUT
    if (commandName === 'timeout') {
      const user = interaction.options.getUser('user');
      const time = interaction.options.getInteger('time');

      const member = await interaction.guild.members.fetch(user.id);
      await member.timeout(time * 1000);

      return interaction.reply(`${user.tag} timed out`);
    }

    // SERVER INFO
    if (commandName === 'serverinfo') {
      return interaction.reply(`Server: ${interaction.guild.name}`);
    }

    // USER INFO
    if (commandName === 'userinfo') {
      const user = interaction.options.getUser('user');
      const member = await interaction.guild.members.fetch(user.id);

      return interaction.reply({
        embeds: [{
          color: 0x2b2d31,
          title: user.tag,
          thumbnail: { url: user.displayAvatarURL() },
          fields: [
            { name: 'ID', value: user.id },
            { name: 'Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>` },
            { name: 'Joined', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` }
          ]
        }]
      });
    }

    // ABOUT
    if (commandName === 'about') {
      return interaction.reply({
        embeds: [{
          color: 0x2b2d31,
          title: 'About Bot',
          description: 'Moderation bot for Discord servers'
        }]
      });
    }

    // ROLE ADD
    if (commandName === 'roleadd') {
      const user = interaction.options.getUser('user');
      const role = interaction.options.getRole('role');

      const member = await interaction.guild.members.fetch(user.id);
      await member.roles.add(role);

      return interaction.reply(`Added role to ${user.tag}`);
    }

    // ROLE REMOVE
    if (commandName === 'roleremove') {
      const user = interaction.options.getUser('user');
      const role = interaction.options.getRole('role');

      const member = await interaction.guild.members.fetch(user.id);
      await member.roles.remove(role);

      return interaction.reply(`Removed role from ${user.tag}`);
    }

  } catch (err) {
    console.error(err);

    if (!interaction.replied && !interaction.deferred) {
      interaction.reply({ content: 'Error occurred while executing command.', ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
