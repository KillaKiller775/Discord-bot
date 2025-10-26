const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('promote')
    .setDescription('Promote a user with specified roles and reason')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to promote')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('current_role')
        .setDescription('Current role of the user')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('new_role')
        .setDescription('New role to assign')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for promotion')
        .setRequired(true)),
  async execute(interaction) {
    try {
      // Check if user has the required role
      if (!interaction.member.roles.cache.has('1428158060639158272')) {
        return await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
      }

      // Check if bot has manage roles permission
      if (!interaction.guild.members.me.permissions.has('ManageRoles')) {
        return await interaction.reply({ content: 'The bot does not have permission to manage roles.', ephemeral: true });
      }

      const user = interaction.options.getUser('user');
      const currentRole = interaction.options.getRole('current_role');
      const newRole = interaction.options.getRole('new_role');
      const reason = interaction.options.getString('reason');

      // Check if the new role is manageable by the bot
      if (!newRole.editable) {
        return await interaction.reply({ content: 'The bot cannot assign this role (role is higher than bot\'s highest role).', ephemeral: true });
      }

      const now = new Date();
      const date = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

      // Get the member object to assign roles
      const member = await interaction.guild.members.fetch(user.id);

      // Assign the new role
      await member.roles.add(newRole);

      const embed = new EmbedBuilder()
        .setTitle('Washington DC Promotion!')
        .setDescription('The Washington DC Roleplay team has decided to promote you! Congratulations on your achievement.')
        .setAuthor({ name: `Author: ${interaction.user.displayName}`, iconURL: interaction.user.displayAvatarURL() })
        .addFields(
          { name: 'Staff Member:', value: `<@${user.id}>`, inline: true },
          { name: 'Rank Change:', value: `<@&${currentRole.id}> → <@&${newRole.id}>`, inline: true },
          { name: 'Promotion Date:', value: date, inline: true },
          { name: 'Reason:', value: reason, inline: false },
        )
        .setColor('#131416')
        .setTimestamp();

      const targetChannel = interaction.guild.channels.cache.get('1428158342211305552');
      if (targetChannel && targetChannel.permissionsFor(interaction.guild.members.me).has('SendMessages')) {
        await targetChannel.send({ content: `<@${user.id}>`, embeds: [embed] });
        await interaction.reply({ content: 'Promotion has been sent to https://discord.com/channels/1428157402565574788/1428158342211305552!', ephemeral: true });
      } else {
        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Error executing promote command:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'An error occurred while processing the promotion. Please try again later.', ephemeral: true });
      } else if (interaction.deferred) {
        await interaction.editReply({ content: 'An error occurred while processing the promotion. Please try again later.' });
      }
    }
  },
};
