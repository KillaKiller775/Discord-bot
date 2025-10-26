const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Display the ticket creation panel'),
  async execute(interaction) {
    try {
      const embed = new EmbedBuilder()
        .setTitle('Create a Support Ticket')
        .setDescription('Click one of the buttons below to create a ticket for the corresponding category.')
        .setColor('#0099ff')
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('ticket_general')
            .setLabel('General Support')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('ticket_bug')
            .setLabel('Bug Report')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('ticket_feature')
            .setLabel('Feature Request')
            .setStyle(ButtonStyle.Success),
        );

      await interaction.reply({ embeds: [embed], components: [row] });
    } catch (error) {
      console.error('Error sending ticket panel:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'An error occurred while displaying the ticket panel. Please try again later.', ephemeral: true });
      } else if (interaction.deferred) {
        await interaction.editReply({ content: 'An error occurred while displaying the ticket panel. Please try again later.' });
      }
    }
  },
};
