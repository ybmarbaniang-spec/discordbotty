const {
  Client,
  GatewayIntentBits,
  REST,
  Routes
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

const warns = new Map();

const MOD_LOG_CHANNEL_ID = "1433417790202839040";

/* ---------------- MOD EMBED ---------------- */

const buildModEmbed = (action, user, reason, moderator) => ({
  color: 0x2b2d31,
  title: `Moderation - ${action}`,
  fields: [
    { name: 'User', value: user, inline: false },
    { name: 'Reason', value: reason || 'No reason provided', inline: false },
    { name: 'Moderator', value: moderator, inline: false },
    { name: 'Time', value: new Date().toLocaleString(), inline: false }
  ]
});

const sendLog = async (guild, embed) => {
  const channel = guild.channels.cache.get(MOD_LOG_CHANNEL_ID);
  if (!channel) return;
  channel.send({ embeds: [embed] });
};

/* ---------------- COMMANDS (21 TOTAL) ---------------- */

const commands = [
  { name: 'kick2', description: 'Kick a user', options: [
    { name: 'user', type: 6, required: true, description: 'User' },
    { name: 'reason', type: 3, required: false, description: 'Reason' }
  ]},

  { name: 'ban2', description: 'Ban a user', options: [
    { name: 'user', type: 6, required: true, description: 'User' },
    { name: 'reason', type: 3, required: false, description: 'Reason' }
  ]},

  { name: 'warn', description: 'Warn a user', options: [
    { name: 'user', type: 6, required: true, description: 'User' },
    { name: 'reason', type: 3, required: false, description: 'Reason' }
  ]},

  { name: 'warnings', description: 'View warnings', options: [
    { name: 'user', type: 6, required: true, description: 'User' }
  ]},

  { name: 'clearwarnings', description: 'Clear warnings', options: [
    { name: 'user', type: 6, required: true, description: 'User' }
  ]},

  { name: 'purge', description: 'Delete messages', options: [
    { name: 'amount', type: 4, required: true, description: 'Amount' }
  ]},

  { name: 'timeout', description: 'Timeout user', options: [
    { name: 'user', type: 6, required: true, description: 'User' },
    { name: 'time', type: 4, required: true, description: 'Seconds' }
  ]},

  { name: 'unban', description: 'Unban user', options: [
    { name: 'user_id', type: 3, required: true, description: 'User ID' }
  ]},

  { name: 'serverinfo', description: 'Server info' },

  { name: 'userinfo', description: 'User info', options: [
    { name: 'user', type: 6, required: true, description: 'User' }
  ]},

  { name: 'about', description: 'About bot' },

  { name: 'help', description: 'Help menu' },

  { name: 'ping', description: 'Bot ping' },

  { name: 'membercount', description: 'Member count' },

  { name: 'roles', description: 'List roles' },

  { name: 'channelinfo', description: 'Channel info' },

  { name: 'slowmode', description: 'Set slowmode', options: [
    { name: 'seconds', type: 4, required: true, description: 'Seconds' }
  ]},

  { name: 'lock', description: 'Lock channel' },

  { name: 'roleadd', description: 'Add role', options: [
    { name: 'user', type: 6, required: true, description: 'User' },
    { name: 'role', type: 8, required: true, description: 'Role' }
  ]},

  { name: 'roleremove', description: 'Remove role', options: [
    { name: 'user', type: 6, required: true, description: 'User' },
    { name: 'role', type: 8, required: true, description: 'Role' }
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
    if (commandName === 'kick2') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const member = await interaction.guild.members.fetch(user.id);

      const embed = buildModEmbed('Kick', user.tag, reason, interaction.user.tag);

      await member.kick(reason);
      await sendLog(interaction.guild, embed);

      return interaction.reply({ embeds: [embed] });
    }

    /* BAN */
    if (commandName === 'ban2') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const member = await interaction.guild.members.fetch(user.id);

      const embed = buildModEmbed('Ban', user.tag, reason, interaction.user.tag);

      await member.ban({ reason });
      await sendLog(interaction.guild, embed);

      return interaction.reply({ embeds: [embed] });
    }

    /* WARN + DM */
    if (commandName === 'warn') {
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'No reason provided';

  const userId = user.id;

if (!warns.has(userId)) {
  warns.set(userId, []);
}

const userWarns = warns.get(userId);

  const warnEntry = {
    reason,
    moderator: interaction.user.tag,
    time: new Date().toLocaleString()
  };

  userWarns.push(warnEntry);
  warns.set(user.id, userWarns);

  const embed = {
    color: 0x2b2d31,
    title: 'User Warned',
    fields: [
      { name: 'User', value: user.tag },
      { name: 'Reason', value: reason },
      { name: 'Moderator', value: interaction.user.tag },
      { name: 'Time', value: warnEntry.time },
      { name: 'Total Warnings', value: `${userWarns.length}` }
    ]
  };

  let dmSent = true;

  try {
    await user.send({ embeds: [embed] });
  } catch (err) {
    dmSent = false;
  }

  await sendLog(interaction.guild, embed);

  return interaction.reply({
    embeds: [embed],
    content: dmSent ? null : 'Warning sent, but user DMs are disabled.'
  });
    }

    /* WARNINGS */
    if (commandName === 'warnings') {
  const user = interaction.options.getUser('user');
  const userId = user.id;
const userWarns = warns.get(userId) || [];

  if (userWarns.length === 0) {
    return interaction.reply({
      content: `${user.tag} currently has no recorded warnings.`,
      ephemeral: true
    });
  }

  const embed = {
    color: 0x2b2d31,
    title: `Warning History: ${user.tag}`,
    description: `Below is the full moderation history of warnings issued to this user.`,
    fields: userWarns.map((w, i) => ({
      name: `Warning #${i + 1}`,
      value:
        `Reason: ${w.reason}.\n` +
        `Moderator: ${w.moderator}.\n` +
        `Issued on: ${w.time}.`
    })),
    footer: {
      text: `Total warnings: ${userWarns.length}.`
    }
  };

  return interaction.reply({ embeds: [embed] });
    }

    /* CLEAR WARNINGS */
    if (commandName === 'clearwarnings') {
      const user = interaction.options.getUser('user');
      warns.set(user.id, []);
      return interaction.reply(`${user.tag} warnings cleared.`);
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

      const embed = buildModEmbed('Timeout', user.tag, `${time}s`, interaction.user.tag);

      await member.timeout(time * 1000);
      await sendLog(interaction.guild, embed);

      return interaction.reply({ embeds: [embed] });
    }

    /* UNBAN */
    if (commandName === 'unban') {
      const id = interaction.options.getString('user_id');
      await interaction.guild.bans.remove(id);
      return interaction.reply(`Unbanned ${id}`);
    }

    /* SERVER INFO */
    if (commandName === 'serverinfo') {
  const g = interaction.guild;

  return interaction.reply({
    embeds: [{
      color: 0x2b2d31,
      title: g.name,
      thumbnail: {
        url: g.iconURL({ dynamic: true, size: 1024 })
      },
      fields: [
        { name: 'Server ID', value: g.id, inline: true },
        { name: 'Owner ID', value: `${g.ownerId}`, inline: true },
        { name: 'Members', value: `${g.memberCount}`, inline: true },

        { name: 'Channels', value: `${g.channels.cache.size}`, inline: true },
        { name: 'Roles', value: `${g.roles.cache.size}`, inline: true },
        { name: 'Boost Level', value: `${g.premiumTier}`, inline: true },

        { name: 'Created', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:F>` }
      ],
      footer: {
        text: 'Server Information'
      }
    }]
  });
    }

    /* USER INFO */
    if (commandName === 'userinfo') {
  const user = interaction.options.getUser('user');
  const member = await interaction.guild.members.fetch(user.id);

  return interaction.reply({
    embeds: [{
      color: 0x2b2d31,
      title: user.tag,
      thumbnail: {
        url: user.displayAvatarURL({ dynamic: true, size: 1024 })
      },
      fields: [
        { name: 'User ID', value: user.id, inline: true },
        { name: 'Server Nickname', value: member.nickname || 'None', inline: true },

        { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>` },
        { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` },

        { name: 'Roles', value: `${member.roles.cache.size - 1}`, inline: true },
        { name: 'Highest Role', value: `${member.roles.highest.name}`, inline: true }
      ],
      footer: {
        text: 'User Information'
      }
    }]
  });
    }

    /* ABOUT */
    if (commandName === 'about') {
  return interaction.reply({
    embeds: [{
      color: 0x2b2d31,
      title: 'About Bot',
      description: 'A moderation and utility bot for Discord servers.',
      fields: [
        {
          name: 'Features',
          value: 'Moderation tools, warnings system, role management, server utilities'
        },
        {
          name: 'Developer',
          value: '<@1345041788804534343>'
        },
        {
          name: 'Version',
          value: '1.0.0'
        }
      ],
      footer: {
        text: 'Stable build'
      }
    }]
  });
    }

    /* HELP */
    if (commandName === 'help') {
  return interaction.reply({
    embeds: [{
      color: 0x2b2d31,
      title: 'Help Menu',
      description: 'List of available commands:',
      fields: [
        {
          name: 'Moderation',
          value: 'kick, ban, warn, warnings, clearwarnings, timeout, unban'
        },
        {
          name: 'Utility',
          value: 'serverinfo, userinfo, channelinfo, membercount, roles'
        },
        {
          name: 'Admin',
          value: 'purge, slowmode, lock, roleadd, roleremove'
        },
        {
          name: 'Bot',
          value: 'ping, about, help'
        }
      ],
      footer: {
        text: 'Use slash commands (/) to run commands'
      }
    }]
  });
    }

    /* BASIC */
    if (commandName === 'ping') return interaction.reply(`Pong! ${client.ws.ping}ms`);
    if (commandName === 'membercount') return interaction.reply(`${interaction.guild.memberCount}`);

    if (commandName === 'roles') {
      const roles = interaction.guild.roles.cache.map(r => r.name).join(', ');
      return interaction.reply(roles);
    }

    if (commandName === 'channelinfo') {
      const c = interaction.channel;

      return interaction.reply({
        embeds: [{
          color: 0x2b2d31,
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
      return interaction.reply(`Slowmode set`);
    }

    /* LOCK */
    if (commandName === 'lock') {
      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        { SendMessages: false }
      );

      return interaction.reply('Channel locked.');
    }

    /* ROLE ADD */
    if (commandName === 'roleadd') {
      const user = interaction.options.getUser('user');
      const role = interaction.options.getRole('role');
      const member = await interaction.guild.members.fetch(user.id);

      await member.roles.add(role);
      return interaction.reply('Role added.');
    }

    /* ROLE REMOVE */
    if (commandName === 'roleremove') {
      const user = interaction.options.getUser('user');
      const role = interaction.options.getRole('role');
      const member = await interaction.guild.members.fetch(user.id);

      await member.roles.remove(role);
      return interaction.reply('Role removed.');
    }

  } catch (err) {
    console.error(err);
    if (!interaction.replied) interaction.reply('Error occurred');
  }
});

client.login(process.env.TOKEN);
