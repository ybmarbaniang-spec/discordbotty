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
  const { guild } = interaction;

  const embed = {
    color: 0x2b2d31,
    title: `${guild.name}`,
    thumbnail: { url: guild.iconURL() },
    fields: [
      { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
      { name: 'Members', value: `${guild.memberCount}`, inline: true },
      { name: 'Server ID', value: guild.id, inline: false },
      { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: false }
    ]
  };

  return interaction.reply({ embeds: [embed] });
    }

    // USER INFO
    if (commandName === 'userinfo') {
  const user = interaction.options.getUser('user');
  const member = await interaction.guild.members.fetch(user.id);

  const embed = {
    color: 0x2b2d31,
    title: `${user.tag}`,
    thumbnail: { url: user.displayAvatarURL() },
    fields: [
      { name: 'User ID', value: user.id, inline: false },
      { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
      { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
      { name: 'Roles', value: member.roles.cache.map(r => r.name).join(', ') || 'None', inline: false }
    ]
  };

  return interaction.reply({ embeds: [embed] });
    }

    // ABOUT
    if (commandName === 'about') {
  const embed = {
    color: 0x2b2d31,
    title: 'About This Bot',
    description: 'A powerful moderation and utility bot built to help manage your server smoothly, keep order, and give staff quick control tools.',
    fields: [
      {
        name: 'Commands',
        value: [
          'kick',
          'ban',
          'warn',
          'warnings',
          'purge',
          'timeout',
          'serverinfo',
          'userinfo',
          'about',
          'roleadd',
          'roleremove'
        ].map(cmd => `• /${cmd}`).join('\n'),
        inline: false
      },
      {
        name: 'Status',
        value: 'Online & Running',
        inline: true
      },
      {
        name: 'Developer',
        value: '<@1345041788804534343>',
        inline: true
      }
    ]
  };

  return interaction.reply({ embeds: [embed] });
    };

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

    if (commandName === 'ping') {
  return interaction.reply(`Pong! ${client.ws.ping}ms`);
}

if (commandName === 'help') {
  const embed = {
    color: 0x2b2d31,
    title: 'Command List',
    description: 'Here are all available commands:',
    fields: [
      { name: 'Moderation', value: 'kick, ban, warn, warnings, mute, purge, timeout' },
      { name: 'Utility', value: 'ping, help, membercount, roles, channelinfo, serverinfo, userinfo, about' },
      { name: 'Server Control', value: 'slowmode, lock, unban, clearwarnings, roleadd, roleremove' }
    ]
  };

  return interaction.reply({ embeds: [embed] });
}

if (commandName === 'membercount') {
  return interaction.reply(`Member Count: ${interaction.guild.memberCount}`);
}

if (commandName === 'roles') {
  const roles = interaction.guild.roles.cache
    .map(r => r.name)
    .slice(0, 20)
    .join(', ');

  return interaction.reply(`Roles: ${roles}`);
}

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

if (commandName === 'slowmode') {
  const seconds = interaction.options.getInteger('seconds');

  await interaction.channel.setRateLimitPerUser(seconds);
  return interaction.reply(`Slowmode set to ${seconds} seconds`);
}

if (commandName === 'lock') {
  await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
    SendMessages: false
  });

  return interaction.reply('Channel locked');
}

if (commandName === 'unban') {
  const userId = interaction.options.getString('user_id');

  await interaction.guild.members.unban(userId);
  return interaction.reply(`Unbanned user ${userId}`);
}

if (commandName === 'clearwarnings') {
  const user = interaction.options.getUser('user');

  warns.set(user.id, []);
  return interaction.reply(`Cleared all warnings for ${user.tag}`);
}

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
      interaction.reply({ content: 'Error occurred while executing command.', ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
