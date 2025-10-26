const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Load config from env or config.json
let config = {};
try {
  const configPath = path.join(__dirname, 'config.json');
  config = fs.existsSync(configPath) ? require(configPath) : {};
} catch (err) {
  console.error('Error loading config.json:', err);
}

// Prefer token from config.json, then env fallback
const token = config.token || process.env.DISCORD_TOKEN;
const clientId = config.clientId || process.env.CLIENT_ID;
const guildId = config.guildId || process.env.GUILD_ID;

if (!token || !clientId) {
  console.error('Missing token or clientId. Set env vars or fill config.json.');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data) commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    if (guildId) {
      // For a single guild (faster):
      // First, delete all existing commands
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
      console.log('Deleted all existing guild commands.');
      // Then register new ones
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log(`Registered ${commands.length} commands to guild ${guildId}`);
    } else {
      // Register globally (may take up to an hour to propagate)
      // First, delete all existing commands
      await rest.put(Routes.applicationCommands(clientId), { body: [] });
      console.log('Deleted all existing global commands.');
      // Then register new ones
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log(`Registered ${commands.length} global commands (may take up to an hour to appear).`);
    }

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
