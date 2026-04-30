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
  { name: 'kickuser', description: 'Kick a user', options: [
    { name: 'user', type: 6, required: true, description: 'User' },
    { name: 'reason', type: 3, required: false, description: 'Reason' }
  ]},

  { name: 'banuser', description: 'Ban a user', options: [
    { name: 'user', type: 6, required: true, description: 'User' },
    { name: 'reason', type: 3, required: false, description: 'Reason' }
  ]},

  { name: 'warnuser', description: 'Warn a user', options: [
    { name: 'user', type: 6, required: true, description: 'User' },
    { name: 'reason', type: 3, required: false, description: 'Reason' }
  ]},

  { name: 'warnings', description: 'View warnings', options: [
    { name: 'user', type: 6, required: true, description: 'User' }
  ]},

  { name: 'clearwarnings', description: 'Clear warnings', options: [
    { name: 'user', type: 6, required: true, description: 'User' }
  ]},

  {
  name: 'removewarning',
  description: 'Remove one warning from a user',
  options: [
    {
      name: 'user',
      type: 6,
      description: 'User to remove warning from',
      required: true
    }
  ]
  },

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

  {
  name: 'slowmode',
  description: 'Set slowmode for the current channel',
  options: [
    {
      name: 'seconds',
      type: 4,
      required: true,
      description: 'Slowmode delay in seconds'
    }
  ]
},

  {
  name: 'slowmodeoff',
  description: 'Disable slowmode in the current channel'
},

  { name: 'lock', description: 'Lock channel' },

  {
  name: 'unlock',
  description: 'Unlock the current channel'
  },

  { name: 'untimeout', description: 'Remove timeout from a user', options: [
  { name: 'user', type: 6, required: true, description: 'User to unmute' }
]},

  { name: 'nickname', description: 'Change a user nickname', options: [
  { name: 'user', type: 6, required: true, description: 'User' },
  { name: 'name', type: 3, required: true, description: 'New nickname' }
]},

  { name: 'avatar', description: 'Get a user avatar', options: [
  { name: 'user', type: 6, required: false, description: 'User' }
]},

  { name: 'servericon', description: 'View the server icon' },

  { name: 'uptime', description: 'Check bot uptime' },

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
    if (commandName === 'kickuser') {

  if (!interaction.member.permissions.has('KickMembers')) {
    return interaction.reply({
      content: 'You need the **Kick Members** permission to use this command.',
      ephemeral: true
    });
  }

  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'No reason provided';

  if (!user) {
    return interaction.reply({
      content: 'Please provide a user to kick.',
      ephemeral: true
    });
  }

  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member) {
    return interaction.reply({
      content: 'User not found in this server.',
      ephemeral: true
    });
  }

  try {
    const embed = buildModEmbed('Kick', user.tag, reason, interaction.user.tag);

    await member.kick(reason);
    await sendLog(interaction.guild, embed);

    return interaction.reply({ embeds: [embed] });

  } catch (err) {
    return interaction.reply({
      content: 'Failed to kick the user. Check role hierarchy and permissions.',
      ephemeral: true
    });
  }
    }

    /* BAN */
    if (commandName === 'banuser') {

  if (!interaction.member.permissions.has('BanMembers')) {
    return interaction.reply({
      content: 'You need the **Ban Members** permission to use this command.',
      ephemeral: true
    });
  }

  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'No reason provided';

  if (!user) {
    return interaction.reply({
      content: 'Please provide a user to ban.',
      ephemeral: true
    });
  }

  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member) {
    return interaction.reply({
      content: 'User not found in this server.',
      ephemeral: true
    });
  }

  try {
    const embed = buildModEmbed('Ban', user.tag, reason, interaction.user.tag);

    await member.ban({ reason });
    await sendLog(interaction.guild, embed);

    return interaction.reply({ embeds: [embed] });

  } catch (err) {
    return interaction.reply({
      content: 'Failed to ban the user. Check role hierarchy and permissions.',
      ephemeral: true
    });
  }
    }

    /* WARN + DM */
    if (commandName === 'warnuser') {

  if (!interaction.member.permissions.has('KickMembers') &&
      !interaction.member.permissions.has('ModerateMembers')) {
    return interaction.reply({
      content: 'You need the **Kick Members** or **Moderate Members** permission to use this command.',
      ephemeral: true
    });
  }

  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'No reason provided';

  if (!user) {
    return interaction.reply({
      content: 'Please provide a user to warn.',
      ephemeral: true
    });
  }

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
  warns.set(userId, userWarns);

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

  if (!interaction.member.permissions.has('KickMembers') &&
      !interaction.member.permissions.has('ModerateMembers')) {
    return interaction.reply({
      content: 'You need the **Kick Members** or **Moderate Members** permission to use this command.',
      ephemeral: true
    });
  }

  const user = interaction.options.getUser('user');

  if (!user) {
    return interaction.reply({
      content: 'Please provide a user whose warnings you want to clear.',
      ephemeral: true
    });
  }

  const userId = user.id;
  const existingWarns = warns.get(userId);

  if (!existingWarns || existingWarns.length === 0) {
    return interaction.reply({
      content: `${user.tag} currently has no warnings to clear.`,
      ephemeral: true
    });
  }

  warns.set(userId, []);

  const embed = {
    color: 0x2b2d31,
    title: 'Warnings Cleared',
    description: `All warnings for **${user.tag}** have been successfully cleared.`,
    fields: [
      { name: 'User', value: user.tag },
      { name: 'Moderator', value: interaction.user.tag },
      { name: 'Previous Warning Count', value: `${existingWarns.length}` }
    ],
    timestamp: new Date()
  };

  await sendLog(interaction.guild, embed);

  return interaction.reply({ embeds: [embed] });
    }

    /* REMOVE WARNING */
if (commandName === 'removewarning') {

  if (!interaction.member.permissions.has('KickMembers') &&
      !interaction.member.permissions.has('ModerateMembers')) {
    return interaction.reply({
      content: 'You need the **Kick Members** or **Moderate Members** permission to use this command.',
      ephemeral: true
    });
  }

  const user = interaction.options.getUser('user');

  if (!user) {
    return interaction.reply({
      content: 'Please provide a user to remove a warning from.',
      ephemeral: true
    });
  }

  const userId = user.id;
  const userWarns = warns.get(userId);

  if (!userWarns || userWarns.length === 0) {
    return interaction.reply({
      content: `${user.tag} has no warnings to remove.`,
      ephemeral: true
    });
  }

  const removedWarn = userWarns.pop();
  warns.set(userId, userWarns);

  const embed = {
    color: 0x2b2d31,
    title: 'Warning Removed',
    description: `One warning has been successfully removed from **${user.tag}**.`,
    fields: [
      { name: 'User', value: user.tag },
      { name: 'Removed Reason', value: removedWarn.reason },
      { name: 'Moderator', value: interaction.user.tag },
      { name: 'Remaining Warnings', value: `${userWarns.length}` }
    ],
    timestamp: new Date()
  };

  await sendLog(interaction.guild, embed);

  return interaction.reply({ embeds: [embed] });
}

    /* PURGE */
    if (commandName === 'purge') {
      const amount = interaction.options.getInteger('amount');
      await interaction.channel.bulkDelete(amount);
      return interaction.reply(`Deleted ${amount} messages.`);
    }

    /* TIMEOUT */
    if (commandName === 'timeout') {

  if (!interaction.member.permissions.has('ModerateMembers')) {
    return interaction.reply({
      content: 'You need the **Moderate Members** permission to use this command.',
      ephemeral: true
    });
  }

  const user = interaction.options.getUser('user');
  const time = interaction.options.getInteger('time');

  if (!user || !time) {
    return interaction.reply({
      content: 'Please provide a user and timeout duration.',
      ephemeral: true
    });
  }

  const member = await interaction.guild.members.fetch(user.id);

  if (!member) {
    return interaction.reply({
      content: 'User not found in this server.',
      ephemeral: true
    });
  }

  const ms = time * 1000;

  if (ms > 28 * 24 * 60 * 60 * 1000) {
    return interaction.reply({
      content: 'Timeout cannot exceed 28 days.',
      ephemeral: true
    });
  }

  try {
    await member.timeout(ms);

    const embed = buildModEmbed(
      'Timeout',
      user.tag,
      `${time}s`,
      interaction.user.tag
    );

    await sendLog(interaction.guild, embed);

    return interaction.reply({ embeds: [embed] });

  } catch (err) {
    return interaction.reply({
      content: 'Failed to apply timeout. Check role hierarchy and permissions.',
      ephemeral: true
    });
  }
    }
    
    /* UNBAN */
    if (commandName === 'unban') {

  if (!interaction.member.permissions.has('BanMembers')) {
    return interaction.reply({
      content: 'You need the **Ban Members** permission to use this command.',
      ephemeral: true
    });
  }

  const id = interaction.options.getString('user_id');

  if (!id) {
    return interaction.reply({
      content: 'Please provide a valid user ID to unban.',
      ephemeral: true
    });
  }

  try {
    const bans = await interaction.guild.bans.fetch();
    const bannedUser = bans.get(id);

    if (!bannedUser) {
      return interaction.reply({
        content: 'This user is not currently banned.',
        ephemeral: true
      });
    }

    await interaction.guild.bans.remove(id);

    const embed = {
      color: 0x2b2d31,
      title: 'User Unbanned',
      description: `Successfully unbanned <@${id}>.`,
      fields: [
        { name: 'User ID', value: id },
        { name: 'Moderator', value: interaction.user.tag }
      ],
      timestamp: new Date()
    };

    await sendLog(interaction.guild, embed);

    return interaction.reply({ embeds: [embed] });

  } catch (err) {
    return interaction.reply({
      content: 'Failed to unban the user. Please check the ID and ensure it is valid.',
      ephemeral: true
    });
  }
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
          value: 'kick, ban, warn, warnings, clearwarnings, removewarnings, timeout, unban'
        },
        {
          name: 'Utility',
          value: 'serverinfo, userinfo, channelinfo, membercount, roles'
        },
        {
          name: 'Admin',
          value: 'purge, slowmode, slowmodeoff, lock, roleadd, roleremove'
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

  if (!interaction.member.permissions.has('ManageChannels')) {
    return interaction.reply({
      content: 'You need **Manage Channels** permission to use this command.',
      ephemeral: true
    });
  }

  const seconds = interaction.options.getInteger('seconds');

  if (seconds === null) {
    return interaction.reply({
      content: 'Please provide a slowmode value in seconds.',
      ephemeral: true
    });
  }

  if (seconds < 0 || seconds > 21600) {
    return interaction.reply({
      content: 'Slowmode must be between 0 and 21600 seconds.',
      ephemeral: true
    });
  }

  await interaction.channel.setRateLimitPerUser(seconds);

  const status = seconds === 0
    ? 'disabled'
    : `set to ${seconds} second${seconds === 1 ? '' : 's'}`;

  return interaction.reply({
    embeds: [{
      color: 0x2b2d31,
      title: 'Slowmode Updated',
      description: `Slowmode has been ${status} in ${interaction.channel}.`,
      footer: {
        text: `Requested by ${interaction.user.tag}`
      },
      timestamp: new Date()
    }]
  });
    }

    /* SLOWMODE OFF */
if (commandName === 'slowmodeoff') {

  if (!interaction.member.permissions.has('ManageChannels')) {
    return interaction.reply({
      content: 'You need **Manage Channels** permission to use this command.',
      ephemeral: true
    });
  }

  await interaction.channel.setRateLimitPerUser(0);

  return interaction.reply({
    embeds: [{
      color: 0x2b2d31,
      title: 'Slowmode Disabled',
      description: `Slowmode has been turned off in ${interaction.channel}.`,
      footer: {
        text: `Requested by ${interaction.user.tag}`
      },
      timestamp: new Date()
    }]
  });
}

    /* LOCK */
if (commandName === 'lock') {
  try {
    const everyone = interaction.guild.roles.everyone;
    const current = interaction.channel.permissionOverwrites.cache.get(everyone.id);

    // Check if already locked
    if (current?.deny.has('SendMessages')) {
      return interaction.reply({
        embeds: [{
          color: 0x2b2d31,
          title: 'Channel Already Locked',
          description: 'This channel is already locked. No changes were made.',
          footer: { text: `Checked by ${interaction.user.tag}` },
          timestamp: new Date()
        }],
        ephemeral: true
      });
    }

    await interaction.channel.permissionOverwrites.edit(everyone, {
      SendMessages: false
    });

    return interaction.reply({
      embeds: [{
        color: 0x2b2d31,
        title: 'Channel Locked',
        description: 'This channel has been locked. Members can no longer send messages.',
        fields: [
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Channel', value: `${interaction.channel}`, inline: true },
          { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
        ],
        footer: { text: 'Moderation System' }
      }]
    });

  } catch (err) {
    console.error(err);

    return interaction.reply({
      embeds: [{
        color: 0x2b2d31,
        title: 'Error',
        description: 'Unable to lock the channel. Please check my permissions and role hierarchy.',
        footer: { text: `Attempted by ${interaction.user.tag}` }
      }],
      ephemeral: true
    });
  }
}

    /* UNLOCK */
if (commandName === 'unlock') {
  try {
    const everyone = interaction.guild.roles.everyone;
    const current = interaction.channel.permissionOverwrites.cache.get(everyone.id);

    // Check if already unlocked
    if (!current || !current.deny.has('SendMessages')) {
      return interaction.reply({
        embeds: [{
          color: 0x2b2d31,
          title: 'Channel Already Unlocked',
          description: 'This channel is already unlocked. Members can send messages.',
          footer: { text: `Checked by ${interaction.user.tag}` },
          timestamp: new Date()
        }],
        ephemeral: true
      });
    }

    await interaction.channel.permissionOverwrites.edit(everyone, {
      SendMessages: true
    });

    return interaction.reply({
      embeds: [{
        color: 0x2b2d31,
        title: 'Channel Unlocked',
        description: 'This channel has been successfully unlocked. Members may now send messages.',
        fields: [
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Channel', value: `${interaction.channel}`, inline: true },
          { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
        ],
        footer: { text: 'Moderation System' }
      }]
    });

  } catch (err) {
    console.error(err);

    return interaction.reply({
      embeds: [{
        color: 0x2b2d31,
        title: 'Error',
        description: 'Unable to unlock the channel. Please check my permissions and role hierarchy.',
        footer: { text: `Attempted by ${interaction.user.tag}` }
      }],
      ephemeral: true
    });
  }
}

    /* UNMUTE */
if (commandName === 'untimeout') {
  try {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id);

    if (!member.isCommunicationDisabled()) {
      return interaction.reply({
        embeds: [{
          color: 0x2b2d31,
          title: 'User Not Muted',
          description: `${user.tag} is not currently timed out.`,
          footer: { text: `Checked by ${interaction.user.tag}` },
          timestamp: new Date()
        }],
        ephemeral: true
      });
    }

    await member.timeout(null);

    return interaction.reply({
      embeds: [{
        color: 0x2b2d31,
        title: 'Timeout Removed',
        description: `${user.tag} has been successfully unmuted.`,
        fields: [
          { name: 'User', value: `${user.tag} (${user.id})` },
          { name: 'Moderator', value: interaction.user.tag },
          { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
        ],
        footer: { text: 'Moderation System' }
      }]
    });

  } catch (err) {
    console.error(err);
    return interaction.reply({
      embeds: [{
        color: 0x2b2d31,
        title: 'Error',
        description: 'Unable to remove timeout. Please check my permissions.',
        footer: { text: `Attempted by ${interaction.user.tag}` }
      }],
      ephemeral: true
    });
  }
}

    /* NICKNAME */
if (commandName === 'nickname') {
  try {
    const user = interaction.options.getUser('user');
    const name = interaction.options.getString('name');
    const member = await interaction.guild.members.fetch(user.id);

    await member.setNickname(name);

    return interaction.reply({
      embeds: [{
        color: 0x2b2d31,
        title: 'Nickname Updated',
        description: `The nickname for ${user.tag} has been updated successfully.`,
        fields: [
          { name: 'New Nickname', value: name },
          { name: 'Moderator', value: interaction.user.tag },
          { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
        ],
        footer: { text: 'Moderation System' }
      }]
    });

  } catch (err) {
    console.error(err);
    return interaction.reply({
      embeds: [{
        color: 0x2b2d31,
        title: 'Error',
        description: 'Unable to change nickname. Check role hierarchy and permissions.',
        footer: { text: `Attempted by ${interaction.user.tag}` }
      }],
      ephemeral: true
    });
  }
}

    /* AVATAR */
if (commandName === 'avatar') {
  const user = interaction.options.getUser('user') || interaction.user;

  return interaction.reply({
    embeds: [{
      color: 0x2b2d31,
      title: `${user.tag}'s Avatar`,
      image: {
        url: user.displayAvatarURL({ dynamic: true, size: 1024 })
      },
      footer: { text: `Requested by ${interaction.user.tag}` }
    }]
  });
}

    /* SERVER ICON */
if (commandName === 'servericon') {
  const icon = interaction.guild.iconURL({ dynamic: true, size: 1024 });

  if (!icon) {
    return interaction.reply({
      embeds: [{
        color: 0x2b2d31,
        title: 'No Server Icon',
        description: 'This server does not have an icon set.',
        footer: { text: `Requested by ${interaction.user.tag}` }
      }],
      ephemeral: true
    });
  }

  return interaction.reply({
    embeds: [{
      color: 0x2b2d31,
      title: `${interaction.guild.name} Icon`,
      image: { url: icon },
      footer: { text: `Requested by ${interaction.user.tag}` }
    }]
  });
}

    /* UPTIME */
if (commandName === 'uptime') {
  const ms = client.uptime;

  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60));

  return interaction.reply({
    embeds: [{
      color: 0x2b2d31,
      title: 'Bot Uptime',
      description: `The bot has been online for ${hours} hours, ${minutes} minutes, and ${seconds} seconds.`,
      footer: { text: `Requested by ${interaction.user.tag}` },
      timestamp: new Date()
    }]
  });
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
