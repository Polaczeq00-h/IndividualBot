import 'dotenv/config';
import fs from 'fs';
import axios from 'axios';
import { 
    Client, 
    GatewayIntentBits, 
    SlashCommandBuilder, 
    REST, 
    Routes, 
    ChannelType, 
    Partials 
} from 'discord.js';
import { Chess } from 'chess.js';

// ------------------- KLIENT -------------------

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

// ------------------- GITHUB COMMIT CHECK -------------------

client.once('clientReady', async (c) => {
    console.log(`Zalogowany jako ${c.user.tag}!`);

    const channel = client.channels.cache.get('1445878372478484540');
    if (!channel) {
        console.log('Nie znalazłem kanału, pajacu.');
        return;
    }

    try {
        const owner = process.env.GITHUB_OWNER || 'Polaczeq00-h';
        const repo = process.env.GITHUB_REPO || 'IndividualBot';
        const branch = process.env.GITHUB_BRANCH || 'main';

        const response = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/commits/${branch}`,
            {
                headers: process.env.GITHUB_TOKEN
                    ? { Authorization: `token ${process.env.GITHUB_TOKEN}` }
                    : {}
            }
        );

        const commit = response.data;
        const commitTitle = commit.commit.message.split('\n')[0];
        const commitLink = commit.html_url;
        const commitAuthor = commit.commit.author.name;
        const commitDate = commit.commit.author.date;

        let lastCommitId = '';
        try {
            lastCommitId = JSON.parse(fs.readFileSync('./lastCommit.json', 'utf-8')).id;
        } catch {}

        if (lastCommitId !== commit.sha) {
            await channel.send(
                `Update działa, kurwa. @everyone\n` +
                `Ostatni commit:\n**${commitTitle}**\n${commitLink}\n` +
                `*Autor: ${commitAuthor}*\n*Data: ${new Date(commitDate).toLocaleString()}*`
            );

            fs.writeFileSync('./lastCommit.json', JSON.stringify({ id: commit.sha }));
            console.log(`Wysłano commit: ${commitTitle}`);
        } else {
            console.log('Brak nowych commitów.');
        }
    } catch (err) {
        console.error('❌ Błąd pobierania commita:', err.message);
    }
});

// ------------------- LISTA KOMEND -------------------

const commands = [
    new SlashCommandBuilder().setName('co').setDescription('Odpowiada gówno i pokazuje ping').setDMPermission(true),

    new SlashCommandBuilder()
        .setName('morda')
        .setDescription('Wyzywa wskazaną osobę')
        .addUserOption(o => o.setName('kto').setDescription('Kogo zwyzywać').setRequired(true))
        .setDMPermission(true),

    new SlashCommandBuilder()
        .setName('zabierz')
        .setDescription('Zabiera coś komuś')
        .addUserOption(o => o.setName('kto').setDescription('Komu zabrać').setRequired(true))
        .setDMPermission(true),

    new SlashCommandBuilder()
        .setName('zajeb')
        .setDescription('Daje mocne jebnięcie komuś')
        .addUserOption(o => o.setName('kto').setDescription('Komu').setRequired(true))
        .setDMPermission(true),

    new SlashCommandBuilder()
        .setName('wkurw')
        .setDescription('Wkurwia kogoś')
        .addUserOption(o => o.setName('kto').setDescription('Kogo').setRequired(true))
        .setDMPermission(true),

    new SlashCommandBuilder()
        .setName('los')
        .setDescription('Losuje losowo cokolwiek wkurwiającego')
        .addUserOption(o => o.setName('kto').setDescription('Dla kogo').setRequired(true))
        .setDMPermission(true),

    new SlashCommandBuilder()
        .setName('lisc')
        .setDescription('Daje liścia komuś')
        .addUserOption(o => o.setName('kto').setDescription('Komu').setRequired(true))
        .setDMPermission(true),

    new SlashCommandBuilder()
        .setName('love')
        .setDescription('Losowy komplement miłosny')
        .addUserOption(o => o.setName('kto').setDescription('Komu').setRequired(false))
        .setDMPermission(true),

    new SlashCommandBuilder().setName('rozkurw').setDescription('Rozkurwia sytuację').setDMPermission(true),
    new SlashCommandBuilder().setName('impreza').setDescription('Opis imprezy').setDMPermission(true),

    new SlashCommandBuilder()
        .setName('torcik')
        .setDescription('Daje torcik komuś')
        .addUserOption(o => o.setName('kto').setDescription('Komu').setRequired(true))
        .setDMPermission(true),

    new SlashCommandBuilder()
        .setName('wyruchaj')
        .setDescription('Losowo wyrucha kogoś')
        .addUserOption(o => o.setName('kto').setDescription('Kogo').setRequired(true))
        .setDMPermission(true),

    new SlashCommandBuilder().setName('porno').setDescription('Losowe porno').setDMPermission(true),

    new SlashCommandBuilder().setName('komendy').setDescription('Wyświetla listę komend').setDMPermission(true),

    // SZACHY
    new SlashCommandBuilder().setName('szachy').setDescription('Rozpoczyna grę w szachy').setDMPermission(true),

    new SlashCommandBuilder()
        .setName('ruch')
        .setDescription('Wykonuje ruch w szachach')
        .addStringOption(o => 
            o.setName('ruch')
            .setDescription('np. e2e4')
            .setRequired(true)
        )
        .setDMPermission(true),
].map(c => c.toJSON());

// ------------------- REJESTR KOMEND -------------------

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('Komendy zarejestrowane!');
    } catch (err) {
        console.error('Błąd rejestracji komend:', err);
    }
})();

// ------------------- LOGIKA KOMEND -------------------

client.on('interactionCreate', async i => {
    if (!i.isChatInputCommand()) return;

    const name = i.commandName;
    const user = i.options?.getUser('kto');
    const targetUser = user || i.user;
    const randomFrom = arr => arr[Math.floor(Math.random() * arr.length)];
    const latency = Date.now() - i.createdTimestamp;

    // ---- SZACHY ----
    if (name === 'szachy') {
        if (!client.games) client.games = {};
        client.games[i.channelId] = new Chess();

        return i.reply('Rozpoczynamy!\n```' + client.games[i.channelId].ascii() + '```');
    }

    if (name === 'ruch') {
        if (!client.games || !client.games[i.channelId])
            return i.reply('Nie ma gry! Użyj /szachy.');

        const game = client.games[i.channelId];
        const move = i.options.getString('ruch');

        const result = game.move(move, { sloppy: true });
        if (!result) return i.reply('Niepoprawny ruch, kurwa.');

        if (game.game_over()) {
            const board = game.ascii();
            delete client.games[i.channelId];
            return i.reply('Koniec gry!\n```' + board + '```');
        }

        const moves = game.moves();
        const aiMove = moves[Math.floor(Math.random() * moves.length)];
        game.move(aiMove);

        if (game.game_over()) {
            const board = game.ascii();
            delete client.games[i.channelId];
            return i.reply(`AI: ${aiMove}\nKoniec gry!\n\`\`\`${board}\`\`\``);
        }

        return i.reply(`AI: ${aiMove}\n\`\`\`${game.ascii()}\`\`\``);
    }

    // ---- KOMENDY BOTOWE ----

    if (name === 'co') return i.reply(`Gówno\nPing: ${latency}ms`);

    if (name === 'komendy') {
        let list = commands.map(c => `/${c.name} – ${c.description}`).join('\n');
        return i.reply('Lista komend:\n' + list);
    }

    if (name === 'porno') {
        const teksty = [
            `<@${i.user.id}> masz swoje PORNO: https://tinyurl.com/freeporn983724623764`,
            `<@${i.user.id}> ty zboczeńcu`,
            `<@${i.user.id}> idź se sam poszukaj`,
            `Nie dostaniesz PORNO, <@${i.user.id}>`,
        ];
        return i.reply(randomFrom(teksty));
    }

    if (name === 'wyruchaj') {
        return i.reply(`<@${i.user.id}> losowo wyruchał ${targetUser}!`);
    }

    if (name === 'morda') {
        const teksty = [
            `${targetUser} wygląda jak patch notes pisany w Paintcie`,
            `${targetUser} to chodzący błąd 404`,
            `${targetUser} pachnie jak przypalony pendrive`
        ];
        return i.reply(randomFrom(teksty));
    }

    if (name === 'zabierz') {
        return i.reply(`<@${i.user.id}> zabrał godność ${targetUser}`);
    }
});

// ------------------- LOGOWANIE -------------------

client.login(process.env.TOKEN);
