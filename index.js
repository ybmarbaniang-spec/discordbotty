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

/* ---------------- MOD LOG ---------------- */

const MOD_LOG_CHANNEL_ID = "1433417790202839040";

const formatLog = (title, user, reason, moderator) => {
  return `Action: ${title}
User: ${user}
Reason: ${reason || 'No reason provided'}
Time: ${new Date().toLocaleString()}
Moderator: ${moderator}`;
};

const sendLog = async (guild, title, user, reason, moderator) => {
  try {
    const channel = guild.channels.cache.get(MOD_LOG_CHANNEL_ID);
    if (!channel) return;

    await channel.send({
      content: "```" + formatLog(title, user, reason, moderator) + "```"
    });
  } catch (err) {
    console.error(err);
  }
};

/* ---------------- COMMANDS ---------------- */

const commands = [
  { name: 'kick', description: 'Kick a user', options: [
    { name: 'user', type: 6, required: true },
    { name: 'reason', type: 3, required: false }
  ]},

  { name: 'ban', description: 'Ban a user', options: [
    { name: 'user', type: 6, required: true },
    { name: 'reason', type: 3, required: false }
  ]},

  { name: 'warn', description: 'Warn a user', options: [
    { name: 'user', type: 6, required: true },
    { name: 'reason', type: 3, required: false }
  ]},

  { name: 'warnings', description: 'View warnings', options: [
    { name: 'user', type: 6, required: true }
  ]},

  { name: 'purge', description: 'Delete messages', options: [
    { name: 'amount', type: 4, required: true }
  ]},

  { name: 'timeout', description: 'Timeout a user', options: [
    { name: 'user', type: 6, required: true },
    { name: 'time', type: 4, required: true }
  ]},

  { name: 'serverinfo', description: 'Server info' },
  { name: 'userinfo', description: 'User info', options: [
    { name: 'user', type: 6, required: true }
  ]},

  { name: 'about', description: 'About bot' },

  { name: 'roleadd', description: 'Add role', options: [
    { name: 'user', type: 6, required: true },
    { name: 'role', type: 8, required: true }
  ]},

  { name: 'roleremove', description: 'Remove role', options: [
    { name: 'user', type: 6, required: true },
    { name: 'role', type: 8, required: true }
  ]},

  { name: 'ping', description: 'Ping bot' },
  { name: 'help', description: 'Help menu' },
  { name: 'membercount', description: 'Member count' },
  { name: 'roles', description: 'List roles' },
  { name: 'channelinfo', description: 'Channel info' },

  { name: 'slowmode', description: 'Set slowmode', options: [
    { name: 'seconds', type: 4, required: true }
  ]},

  { name: 'lock', description: 'Lock channel' },

  { name: 'unban', description: 'Unban user', options: [
    { name: 'user_id', type: 3, required: true }
  ]},

  { name: 'clearwarnings', description: 'Clear warnings', options: [
    { name: 'user', type: 6, required: true }
  ]}
];

/* ---------------- READY ---------------- */

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );

  console.log('Commands registered');
});

/* ---------------- COMMAND HANDLER ---------------- */

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {

    /* KICK */
    if (commandName === 'kick') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason';
      const member = await interaction.guild.members.fetch(user.id);

      await member.kick(reason);

      await sendLog(interaction.guild, 'Kick', user.tag, reason, interaction.user.tag);

      return interaction.reply(`${user.tag} was kicked.`);
    }

    /* BAN */
    if (commandName === 'ban') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason';
      const member = await interaction.guild.members.fetch(user.id);

      await member.ban({ reason });

      await sendLog(interaction.guild, 'Ban', user.tag, reason, interaction.user.tag);

      return interaction.reply(`${user.tag} was banned.`);
    }

    /* WARN */
    if (commandName === 'warn') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason';

      if (!warns.has(user.id)) warns.set(user.id, []);
      warns.get(user.id).push(reason);

      await sendLog(interaction.guild, 'Warn', user.tag, reason, interaction.user.tag);

      return interaction.reply(`${user.tag} was warned.`);
    }

    /* WARNINGS */
    if (commandName === 'warnings') {
      const user = interaction.options.getUser('user');
      const list = warns.get(user.id) || [];

      return interaction.reply(
        list.length
          ? list.map((w, i) => `${i + 1}. ${w}`).join('\n')
          : `${user.tag} has no warnings.`
      );
    }

    /* PURGE */
    if (commandName === 'purge') {
      const amount = interaction.options.getInteger('amount');
      await interaction.channel.bulkDelete(amount);
      return interaction.reply(`Deleted ${amount} messages.`);
    }

    /* TIMEOUT */
    if (commandName === 'timeout') {
      const user = interaction.options.getUser('user');
      const time = interaction.options.getInteger('time');
      const member = await interaction.guild.members.fetch(user.id);

      await member.timeout(time * 1000);

      await sendLog(interaction.guild, 'Timeout', user.tag, `${time}s`, interaction.user.tag);

      return interaction.reply(`${user.tag} was timed out.`);
    }

    /* SERVER INFO */
    if (commandName === 'serverinfo') {
      const g = interaction.guild;

      return interaction.reply({
        embeds: [{
          title: g.name,
          fields: [
            { name: 'Members', value: `${g.memberCount}` },
            { name: 'ID', value: g.id },
            { name: 'Created', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:R>` }
          ]
        }]
      });
    }

    /* USER INFO */
    if (commandName === 'userinfo') {
      const user = interaction.options.getUser('user');
      const member = await interaction.guild.members.fetch(user.id);

      return interaction.reply({
        embeds: [{
          title: user.tag,
          fields: [
            { name: 'ID', value: user.id },
            { name: 'Joined', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` }
          ]
        }]
      });
    }

    /* ABOUT */
    if (commandName === 'about') {
      return interaction.reply({
        embeds: [{
          title: 'About Bot',
          description: 'Moderation bot'
        }]
      });
    }

    /* PING */
    if (commandName === 'ping') {
      return interaction.reply(`Pong! ${client.ws.ping}ms`);
    }

    /* MEMBERCOUNT */
    if (commandName === 'membercount') {
      return interaction.reply(`${interaction.guild.memberCount}`);
    }

    /* ROLES */
    if (commandName === 'roles') {
      const roles = interaction.guild.roles.cache.map(r => r.name).slice(0, 20).join(', ');
      return interaction.reply(roles);
    }

    /* CHANNEL INFO */
    if (commandName === 'channelinfo') {
      const c = interaction.channel;

      return interaction.reply({
        embeds: [{
          title: 'Channel Info',
          fields: [
            { name: 'Name', value: c.name },
            { name: 'ID', value: c.id }
          ]
        }]
      });
    }

    /* SLOWMODE */
    if (commandName === 'slowmode') {
      const seconds = interaction.options.getInteger('seconds');
      await interaction.channel.setRateLimitPerUser(seconds);
      return interaction.reply(`Slowmode set to ${seconds}`);
    }

    /* LOCK */
    if (commandName === 'lock') {
      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        { SendMessages: false }
      );

      return interaction.reply('Channel locked.');
    }

    /* UNBAN */
    if (commandName === 'unban') {
      const id = interaction.options.getString('user_id');
      await interaction.guild.members.unban(id);
      return interaction.reply(`Unbanned ${id}`);
    }

    /* CLEAR WARNINGS */
    if (commandName === 'clearwarnings') {
      const user = interaction.options.getUser('user');
      warns.set(user.id, []);
      return interaction.reply(`${user.tag} warnings cleared.`);
    }

    /* ROLE ADD */
    if (commandName === 'roleadd') {
      const user = interaction.options.getUser('user');
      const role = interaction.options.getRole('role');
      const member = await interaction.guild.members.fetch(user.id);

      await member.roles.add(role);
      return interaction.reply(`${user.tag} role added.`);
    }

    /* ROLE REMOVE */
    if (commandName === 'roleremove') {
      const user = interaction.options.getUser('user');
      const role = interaction.options.getRole('role');
      const member = await interaction.guild.members.fetch(user.id);

      await member.roles.remove(role);
      return interaction.reply(`${user.tag} role removed.`);
    }

  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      interaction.reply('Error occurred.');
    }
  }
});

client.login(process.env.TOKEN);
