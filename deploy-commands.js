const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
  {
    name: 'hello',
    description: 'siema kurwa od individualbota'
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Rejestruję slash komendy...');

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log('Zarejestrowane jak trzeba, gnoju.');
  } catch (error) {
    console.error('Spierdoliło się:', error);
  }
})();
