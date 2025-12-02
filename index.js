// Kompletny zestaw komend memicznych dla twojego bota
// discord.js v14 poprawiony pod DM + GLOBAL

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

// INTENTY DO DM
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: ['CHANNEL'] // żeby DM działały
});

// --------------------------- DEFINICJE KOMEND ---------------------------

const commands = [
  new SlashCommandBuilder()
    .setName('kot')
    .setDescription('Wysyła kota')
    .setDMPermission(true),

  new SlashCommandBuilder()
    .setName('pies')
    .setDescription('Wysyła psa')
    .setDMPermission(true),

  new SlashCommandBuilder()
    .setName('morda')
    .setDescription('Wyzywa wskazaną osobę')
    .addUserOption(o => o.setName('kto').setDescription('Kogo zwyzywać').setRequired(true))
    .setDMPermission(true),

  new SlashCommandBuilder()
    .setName('komplement')
    .setDescription('Daje pojebany komplement')
    .addUserOption(o => o.setName('kto').setDescription('Dla kogo').setRequired(true))
    .setDMPermission(true),

  new SlashCommandBuilder()
    .setName('pullup')
    .setDescription('Podciągnij się dziadu')
    .setDMPermission(true),

  new SlashCommandBuilder()
    .setName('rate')
    .setDescription('Oceniam cokolwiek')
    .addStringOption(o => o.setName('co').setDescription('Co ocenić').setRequired(true))
    .setDMPermission(true),

  new SlashCommandBuilder()
    .setName('losuj')
    .setDescription('Losuje z listy')
    .addStringOption(o => o.setName('lista').setDescription('opcja1, opcja2, opcja3').setRequired(true))
    .setDMPermission(true),

  new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Mądra kula odpowiada')
    .addStringOption(o => o.setName('pytanie').setDescription('O co pytasz?').setRequired(true))
    .setDMPermission(true),

  new SlashCommandBuilder()
    .setName('kox')
    .setDescription('Staty RPG dla pajaca')
    .addUserOption(o => o.setName('kto').setDescription('Kto?').setRequired(true))
    .setDMPermission(true),

  new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Losowy mem z folderu ./memes/')
    .setDMPermission(true),

  new SlashCommandBuilder()
    .setName('qr')
    .setDescription('Generuje QR z tekstu')
    .addStringOption(o => o.setName('tekst').setDescription('Co zamienić na QR').setRequired(true))
    .setDMPermission(true),

  new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Avatar użytkownika')
    .addUserOption(o => o.setName('kto').setDescription('Kogo avatar?').setRequired(true))
    .setDMPermission(true),

  new SlashCommandBuilder()
    .setName('ship')
    .setDescription('Łączy dwie osoby w parę')
    .addUserOption(o => o.setName('a').setDescription('Osoba A').setRequired(true))
    .addUserOption(o => o.setName('b').setDescription('Osoba B').setRequired(true))
    .setDMPermission(true),

  new SlashCommandBuilder()
    .setName('tort')
    .setDescription('Daje komuś tort')
    .addUserOption(o => o.setName('kto').setDescription('Dla kogo').setRequired(true))
    .setDMPermission(true),

  new SlashCommandBuilder()
    .setName('kostka')
    .setDescription('Rzuca kostką')
    .addStringOption(o => o.setName('typ').setDescription('np. d6, d20').setRequired(true))
    .setDMPermission(true),

  new SlashCommandBuilder()
    .setName('motywacja')
    .setDescription('Daje motywację z piwnicy')
    .setDMPermission(true),

  new SlashCommandBuilder()
    .setName('odlicz')
    .setDescription('Odlicza 5 do 1')
    .setDMPermission(true),

  new SlashCommandBuilder()
    .setName('przeklenstwo')
    .setDescription('Tworzy losowe poetyckie bluzgi')
    .setDMPermission(true),

  new SlashCommandBuilder()
    .setName('sus')
    .setDescription('Wykrywa podejrzanego')
    .addUserOption(o => o.setName('kto').setDescription('Kto podejrzany?').setRequired(true))
    .setDMPermission(true)
].map(c => c.toJSON());

// --------------------------- REJESTRACJA GLOBAL ---------------------------

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function registerCommands() {
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('Zarejestrowano GLOBALNE komendy (DM też działają).');
  } catch (err) {
    console.error(err);
  }
}

registerCommands();

// --------------------------- LOGIKA KOMEND ---------------------------

client.on('interactionCreate', async (i) => {
  if (!i.isChatInputCommand()) return;

  const name = i.commandName;

  if (name === 'kot') return i.reply('https://cataas.com/cat');
  if (name === 'pies') return i.reply('https://random.dog/woof.json (weź se ogarnij json)');

  if (name === 'morda') {
    const user = i.options.getUser('kto');
    const teksty = [
      `${user} wygląda jak patch notesy po pijaku`,
      `${user}, twoja twarz to błąd 404`,
      `${user} ma aurę Windowsa XP po formacie`
    ];
    return i.reply(teksty[Math.floor(Math.random()*teksty.length)]);
  }

  if (name === 'komplement') {
    const user = i.options.getUser('kto');
    const komps = [
      `${user} świecisz jak monitor CRT po przegrzaniu`,
      `${user}, masz vibe osoby co ogarnia życie... prawie`,
      `${user} wygląda jak tryhard którego lubię`
    ];
    return i.reply(komps[Math.floor(Math.random()*komps.length)]);
  }

  if (name === 'pullup') {
    const lvl = Math.floor(Math.random()*101);
    return i.reply(`Podciągnięte na ${lvl}%`);
  }

  if (name === 'rate') {
    const co = i.options.getString('co');
    return i.reply(`${co}: **${Math.floor(Math.random()*101)} / 100**`);
  }

  if (name === 'losuj') {
    const list = i.options.getString('lista').split(',').map(x=>x.trim());
    const pick = list[Math.floor(Math.random()*list.length)];
    return i.reply(`Wylosowano: **${pick}**`);
  }

  if (name === '8ball') {
    const odp = ['tak', 'nie', 'może', 'spierdalaj z tym pytaniem'];
    return i.reply(odp[Math.floor(Math.random()*odp.length)]);
  }

  if (name === 'kox') {
    const u = i.options.getUser('kto');
    return i.reply(`${u}: siła ${Math.floor(Math.random()*10)}, inteligencja ${Math.floor(Math.random()*10)}, szczęście ${Math.floor(Math.random()*10)}`);
  }

  if (name === 'meme') return i.reply({ files: [`./memes/${Math.floor(Math.random()*5)+1}.jpg`] });

  if (name === 'qr') {
    const txt = i.options.getString('tekst');
    return i.reply(`QR do: ${txt} (tu dodaj generator)`);
  }

  if (name === 'avatar') {
    const u = i.options.getUser('kto');
    return i.reply(u.displayAvatarURL({ size: 1024 }));
  }

  if (name === 'ship') {
    const a = i.options.getUser('a');
    const b = i.options.getUser('b');
    const percent = Math.floor(Math.random()*101);
    return i.reply(`${a} ❤️ ${b} = ${percent}%`);
  }

  if (name === 'tort') {
    const u = i.options.getUser('kto');
    return i.reply(`🎂 Tort dla ${u} (ale z biedronki)`);
  }

  if (name === 'kostka') {
    const t = i.options.getString('typ');
    const n = parseInt(t.replace('d',''));
    return i.reply(`Rzut: **${Math.floor(Math.random()*n)+1}**`);
  }

  if (name === 'motywacja') return i.reply('Wstawaj, świat cię jeszcze nie dobił.');

  if (name === 'odlicz') return i.reply('5... 4... 3... 2... 1... JEBUDU');

  if (name === 'przeklenstwo') {
    const parts = ['karmazynowy', 'sflaczały', 'parujący', 'kaprawy'];
    const ends = ['mózgożłopie', 'szczuroklapie', 'bobrowa plamo'];
    return i.reply(`${parts[Math.floor(Math.random()*parts.length)]} ${ends[Math.floor(Math.random()*ends.length)]}`);
  }

  if (name === 'sus') {
    const u = i.options.getUser('kto');
    return i.reply(`${u} jest podejrzany jak Among Us w 2020`);
  }
});

// LOGIN
client.login(process.env.DISCORD_TOKEN);
