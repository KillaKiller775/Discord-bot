const { Client, GatewayIntentBits, MessageFlags, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

// When the bot is ready, log this message
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Handle disconnection and attempt to reconnect
client.on('disconnect', () => {
  console.log('Bot disconnected. Attempting to reconnect...');
  setTimeout(() => {
    client.login(TOKEN);
  }, 5000); // Retry after 5 seconds
});

// Handle errors
client.on('error', (error) => {
  console.error('Client error:', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Optionally, restart the bot or exit gracefully
  process.exit(1);
});

// Handle SIGINT (Ctrl+C) to gracefully shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

// Handle message commands
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.guild) return;

});

// Handle the slash command
client.on('interactionCreate', async interaction => {
  // Handle select menu interactions for commands that expose handlers
  if (interaction.isStringSelectMenu && interaction.customId === 'rules_select') {
    try {
      const value = interaction.values[0];
      // lazy-load the rules command module
      const rulesCmd = require(path.join(__dirname, 'commands', 'rules.js'));
      if (rulesCmd && typeof rulesCmd.handleSelect === 'function') {
        await rulesCmd.handleSelect(interaction, value);
        return;
      }
    } catch (err) {
      console.error('Error handling select menu:', err);
      try {
        if (!interaction.deferred && !interaction.replied) await interaction.reply({ content: 'Failed to handle selection.', flags: MessageFlags.Ephemeral });
        else if (interaction.deferred || interaction.replied) await interaction.editReply({ content: 'Failed to handle selection.' });
      } catch (e) { /* ignore */ }
    }
  }



  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  // Load commands dynamically
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(__dirname, 'commands', file));
    // Support modules that export `name` or a `data` (SlashCommandBuilder) with a name
    const name = command.name || (command.data && command.data.name);
    if (name === commandName) {
      await command.execute(interaction);
      return;
    }
  }
});

// Log in to Discord with your bot token
// Load token from config.json first, then environment variable DISCORD_TOKEN as fallback
let TOKEN;
try {
  const configPath = path.join(__dirname, 'config.json');
  const config = fs.existsSync(configPath) ? require(configPath) : {};
  TOKEN = config.token || process.env.DISCORD_TOKEN;
} catch (err) {
  console.error('Error loading config.json:', err);
}

if (!TOKEN) {
  console.error('Discord token not found. Add token to config.json (preferred) or set DISCORD_TOKEN env var.');
  process.exit(1);
}

client.login(TOKEN);