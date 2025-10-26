const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

// Optional per-option images. Set the URL strings below to add images to the top (thumbnail)
// and bottom (main image) of each embed. Leave empty string to omit.
const IMAGE_TOP = {
  general: 'https://imgur.com/9trroO0.png',
  'Core Roleplay Principles': 'https://imgur.com/9trroO0.png',
  'Combat & Interaction Rules': 'https://imgur.com/9trroO0.png',
  safety: 'https://imgur.com/9trroO0.png',
};

const IMAGE_BOTTOM = {
  general: 'https://imgur.com/O5oljOG.png',
  'Core Roleplay Principles': 'https://imgur.com/O5oljOG.png',
  'Combat & Interaction Rules': 'https://imgur.com/O5oljOG.png',
  safety: 'https://imgur.com/O5oljOG.png',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Show server rules menu'),
  async execute(interaction) {
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('rules_select')
        .setPlaceholder('Select rules to view')
        .addOptions([
          { label: 'Core Roleplay Principles', value: 'Core Roleplay Principles' },
          { label: 'Combat & Interaction Rules', value: 'Combat & Interaction Rules' },
          { label: 'Safety & Reporting', value: 'Safety & Reporting' },
        ])
    );

    const embedsToSend = [];
    // banner at top
    if (IMAGE_TOP.general) {
      const banner = new EmbedBuilder().setColor('#131416').setImage(IMAGE_TOP.general);
      embedsToSend.push(banner);
    }

    const embed = new EmbedBuilder()
      .setColor('#131416')
      .setDescription('Washington DC Roleplay enforces strict policies and regulations. Please read each rule to avoid moderation and ensure you enjoy your time here at WDCRP. If you find any issues with rules or have any other questions you can go to our [assistance](https://discord.com/channels/1428157402565574788/1428158130470256753) channel and make a ticket, A staff member will assist you with whatever you need.')
      .setImage(IMAGE_BOTTOM.general);

    embedsToSend.push(embed);

    await interaction.deferReply();
    await interaction.channel.send({ embeds: embedsToSend, components: [row] });
    await interaction.deleteReply();
  },

  // Called by index.js when the select menu is used
  async handleSelect(interaction, value) {
    // Build three different embeds depending on the selected value
    let embed;
    if (value === 'Core Roleplay Principles') {
      embed = new EmbedBuilder()
        .setDescription('You are required to abide by these set rules when communicating to avoid moderation.')
        .setColor('#131416')
        .addFields(
          { name: 'Rule 1 — Realistic Roleplay', value: '> Maintain a realistic character and actions throughout gameplay. Avoid behaviors or actions that would be impossible or implausible in real life.', inline: false },
          { name: 'Rule 2 — New Life Rule (NLR)', value: '> After your character dies, you must forget all previous events. You cannot seek revenge, return to the death scene, or remember details from your "past life".', inline: false },
          { name: 'Rule 3 — Common Sense', value: '> Apply real-world logic and judgment to all roleplay situations. Staff has final discretion on what constitutes reasonable behavior.', inline: false },
          { name: 'Rule 4 — Realistic Driving', value: '> Drive as you would in real life with appropriate speeds and safety. No excessive speeding or unrealistic maneuvers through populated areas.', inline: false },
          { name: 'Rule 5 — Emergency Vehicle Protocol', value: '> All players must yield (move to the right) for emergency vehicles. Do not interfere with police pursuits by blocking or causing crashes.', inline: false }
        );
      // Do not set a thumbnail; we use a banner embed above the main embed instead.
      if (IMAGE_BOTTOM[value]) embed.setImage(IMAGE_BOTTOM[value]);
    } else if (value === 'Combat & Interaction Rules') {
      embed = new EmbedBuilder()
        .setColor('#131416')
        .addFields(
          { name: 'Rule 6 | Random Death Match (RDM)', value: '> Never kill, shoot, punch, or attack other players without valid roleplay justification. All violence must be preceded by appropriate role-play interaction.', inline: false },
          { name: 'Rule 7 | Vehicle Death Match (VDM)', value: '> Do not use vehicles as weapons without roleplay justification. Ramming or running over players without cause is prohibited.', inline: false },
          { name: 'Rule 8 | Safe Zone Policy', value: '> Violence in designated safe zones requires a legitimate roleplay reason. Ongoing roleplay scenes may continue in safe zones if started elsewhere. Prison breaks or shootouts at the County Jail require Moderator permission.', inline: false },
          { name: 'Rule 9 | Criminal Activity Cooldown', value: '> Players must allow reasonable time between criminal acts to maintain roleplay quality. Continuous criminal behavior without breaks negatively impacts the server experience and immersion.', inline: false },
        );
      // no thumbnail
      if (IMAGE_BOTTOM['Combat & Interaction Rules']) embed.setImage(IMAGE_BOTTOM['Combat & Interaction Rules']);
    } else if (value === 'safety') {
      embed = new EmbedBuilder()
        .setColor('#131416')
        .addFields(
          { name: 'Rule 10 — Harassment & Discrimination', value: '> No harassment, bullying, or discrimination based on race, gender, religion, or any other characteristic. This includes in-game and out-of-game behavior.', inline: false },
          { name: 'Rule 11 — Reporting Procedures', value: '> Report violations to staff via DM or the designated report channel. Provide evidence such as screenshots or logs when possible.', inline: false },
          { name: 'Rule 12 — Do Not Engage', value: '> Do not retaliate against or engage with abusive users. Let staff handle the situation to avoid escalation.', inline: false },
          { name: 'Rule 13 — Privacy & Safety', value: '> Do not share personal information, including real names, addresses, or contact details. Respect others\' privacy.', inline: false },
          { name: 'Rule 14 — Staff Impersonation', value: '> Do not impersonate staff members or falsely claim authority. This undermines server trust and safety.', inline: false }
        );
      // no thumbnail
      if (IMAGE_BOTTOM.safety) embed.setImage(IMAGE_BOTTOM.safety);
    } else {
      embed = new EmbedBuilder().setDescription('Unknown\n\nUnknown selection').setColor('#131416');
    }

    // Acknowledge the interaction and send the embeds ephemerally (only visible to the user).
    // If IMAGE_TOP exists we send a banner embed first, then the main embed (so the image appears above content).
    try {
      if (!interaction.deferred && !interaction.replied) await interaction.deferReply({ ephemeral: true });

      const embedsToSend = [];
      // banner at top
      if (IMAGE_TOP[value]) {
        const banner = new EmbedBuilder().setColor('#131416').setImage(IMAGE_TOP[value]);
        embedsToSend.push(banner);
      }

      // main embed (already built in `embed` variable). If bottom image present, set it on main embed.
      if (IMAGE_BOTTOM[value]) {
        embed.setImage(IMAGE_BOTTOM[value]);
      }
      embedsToSend.push(embed);

      await interaction.editReply({ embeds: embedsToSend });
    } catch (err) {
      console.error('Failed to handle rules select:', err);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'Failed to send rules message.', ephemeral: true });
        } else {
          try { await interaction.editReply({ content: 'Failed to send rules message.' }); } catch (e) { /* ignore */ }
        }
      } catch (e) { /* ignore */ }
    }
  }
};
