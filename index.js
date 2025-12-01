require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.login(process.env.DISCORD_TOKEN);

client.once('ready', () => {
    console.log(`Zalogowany jako ${client.user.tag}!`);
});

// Rejestracja slash command (guild)
const commands = [
    {
        name: 'hello',
        description: 'Siema, bot odpowie po polsku!'
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Rejestracja komend (/)…');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('Komendy zarejestrowane!');
    } catch (error) {
        console.error(error);
    }
})();

// Obsługa interakcji w discord.js
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'hello') {
        await interaction.reply('Siema, to IndividualBot!');
    }
});
