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
  { name: 'kick', description: 'Kick a user', options: [{ name: 'user', type: 6, required: true, description: 'User to kick' }, { name: 'reason', type: 3, description: 'Reason' }] },
  { name: 'ban', description: 'Ban a user', options: [{ name: 'user', type: 6, required: true, description: 'User to ban' }, { name: 'reason', type: 3, description: 'Reason' }] },
  { name: 'warn', description: 'Warn a user', options: [{ name: 'user', type: 6, required: true, description: 'User' }, { name: 'reason', type: 3, description: 'Reason' }] },
  { name: 'warnings', description: 'View warnings', options: [{ name: 'user', type: 6, required: true, description: 'User' }] },
  { name: 'purge', description: 'Delete messages', options: [{ name: 'amount', type: 4, required: true, description: 'Amount' }] },
  { name: 'timeout', description: 'Timeout a user', options: [{ name: 'user', type: 6, required: true, description: 'User' }, { name: 'time', type: 4, required: true, description: 'Seconds' }] },

  { name: 'serverinfo', description: 'Server info' },
  { name: 'userinfo', description: 'User info', options: [{ name: 'user', type: 6, required: true, description: 'User' }] },
  { name: 'about', description: 'About bot' },

  { name: 'roleadd', description: 'Add role', options: [{ name: 'user', type: 6, required: true, description: 'User' }, { name: 'role', type: 8, required: true, description: 'Role' }] },
  { name: 'roleremove', description: 'Remove role', options: [{ name: 'user', type: 6, required: true, description: 'User' }, { name: 'role', type: 8, required: true, description: 'Role' }] },

  // NEW COMMANDS ADDED BELOW
  { name: 'ping', description: 'Check bot latency' },
  { name: 'help', description: 'Show commands' },
  { name: 'membercount', description: 'Server member count' },
  { name: 'roles', description: 'List roles' },
  { name: 'channelinfo', description: 'Channel info' },

  {
    name: 'slowmode',
    description: 'Set slowmode',
    options: [
      { name: 'seconds', type: 4, required: true, description: 'Seconds' }
    ]
  },

  { name: 'lock', description: 'Lock channel' },

  {
    name: 'unban',
    description: 'Unban user',
    options: [
      { name: 'user_id', type: 3, required: true, description: 'User ID' }
    ]
  },

  {
    name: 'clearwarnings',
    description: 'Clear warnings',
    options: [
      { name: 'user', type: 6, required: true, description: 'User' }
    ]
  },

  {
    name: 'mute',
    description: 'Mute user',
    options: [
      { name: 'user', type: 6, required: true, description: 'User' },
      { name: 'time', type: 4, required: true, description: 'Seconds' }
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

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {

    // KICK (UNCHANGED LOGIC)
    if (commandName === 'kick') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason';
      const member = await interaction.guild.members.fetch(user.id);

      await member.kick(reason);
      return interaction.reply(`Kicked ${user.tag}`);
    }

    // BAN (UNCHANGED LOGIC)
    if (commandName === 'ban') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason';
      const member = await interaction.guild.members.fetch(user.id);

      await member.ban({ reason });
      return interaction.reply(`Banned ${user.tag}`);
    }

    // WARN (UNCHANGED LOGIC)
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
        return interaction.reply({
          content: `${user.tag} has no warnings.`,
          ephemeral: true
        });
      }

      const formatted = userWarns
        .map((w, i) => `${i + 1}. ${w
                                    // PING
    if (commandName === 'ping') {
      return interaction.reply(`Pong! ${client.ws.ping}ms`);
    }

    // HELP
    if (commandName === 'help') {
      const embed = {
        color: 0x2b2d31,
        title: 'Command List',
        description: 'All available bot commands:',
        fields: [
          { name: 'Moderation', value: 'kick, ban, warn, warnings, purge, timeout, mute' },
          { name: 'Utility', value: 'ping, help, membercount, roles, channelinfo, serverinfo, userinfo, about' },
          { name: 'Server Control', value: 'slowmode, lock, unban, clearwarnings, roleadd, roleremove' }
        ]
      };

      return interaction.reply({ embeds: [embed] });
    }

    // MEMBER COUNT
    if (commandName === 'membercount') {
      return interaction.reply(`Member Count: ${interaction.guild.memberCount}`);
    }

    // ROLES
    if (commandName === 'roles') {
      const roles = interaction.guild.roles.cache
        .map(r => r.name)
        .slice(0, 20)
        .join(', ');

      return interaction.reply(`Roles: ${roles}`);
    }

    // CHANNEL INFO
    if (commandName === 'channelinfo') {
      const channel = interaction.channel;

      const embed = {
        color: 0x2b2d31,
        title: 'Channel Info',
        fields: [
          { name: 'Name', value: channel.name, inline: true },
          { name: 'ID', value: channel.id, inline: true },
          { name: 'Type', value: channel.type.toString(), inline: true },
          { name: 'Created', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>` }
        ]
      };

      return interaction.reply({ embeds: [embed] });
    }

    // SLOWMODE
    if (commandName === 'slowmode') {
      const seconds = interaction.options.getInteger('seconds');

      await interaction.channel.setRateLimitPerUser(seconds);
      return interaction.reply(`Slowmode set to ${seconds} seconds`);
    }

    // LOCK CHANNEL
    if (commandName === 'lock') {
      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        { SendMessages: false }
      );

      return interaction.reply('Channel locked');
    }

    // UNBAN
    if (commandName === 'unban') {
      const userId = interaction.options.getString('user_id');

      await interaction.guild.bans.remove(userId);
      return interaction.reply(`Unbanned user ${userId}`);
    }

    // CLEAR WARNINGS
    if (commandName === 'clearwarnings') {
      const user = interaction.options.getUser('user');

      warns.set(user.id, []);
      return interaction.reply(`Cleared all warnings for ${user.tag}`);
    }

    // MUTE
    if (commandName === 'mute') {
      const user = interaction.options.getUser('user');
      const time = interaction.options.getInteger('time');

      const member = await interaction.guild.members.fetch(user.id);
      await member.timeout(time * 1000);

      return interaction.reply(`Muted ${user.tag} for ${time}s`);
    }

  } catch (err) {
    console.error(err);

    if (!interaction.replied && !interaction.deferred) {
      interaction.reply({
        content: 'Error occurred while executing command.',
        ephemeral: true
      });
    }
  }
});

client.login(process.env.TOKEN);
