import path from 'path';
import 'dotenv/config';
import fs from 'fs';
import pkg from './package.json' with { type: 'json' };
const BOT_VERSION = pkg.version;
import axios from 'axios';
import QRCode from 'qrcode';
import { 
    Client, 
    GatewayIntentBits, 
    SlashCommandBuilder, 
    REST, 
    Routes, 
    ChannelType, 
    Partials,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    EmbedBuilder
} from 'discord.js';

// ------------------- SYSTEM PRZECHOWYWANIA DŁUGÓW (JSON-based) -------------------

const DATA_DIR = './data';
const DEBTS_FILE = `${DATA_DIR}/debts.json`;

// Upewnie się że folder data istnieje
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Załaduj lub inicjalizuj długi
let debtsData = { debts: [], nextId: 1 };
if (fs.existsSync(DEBTS_FILE)) {
    try {
        debtsData = JSON.parse(fs.readFileSync(DEBTS_FILE, 'utf-8'));
    } catch (err) {
        console.warn('⚠️ Błąd czytania debts.json, resetuję:', err.message);
        debtsData = { debts: [], nextId: 1 };
    }
}

// Helper functions do zarządzania długami
const saveDebts = () => {
    try {
        fs.writeFileSync(DEBTS_FILE, JSON.stringify(debtsData, null, 2));
    } catch (err) {
        console.error('❌ Błąd zapisu debts:', err.message);
    }
};

const addDebt = (creditorId, debtorId, amount, reason, guildId) => {
    const id = debtsData.nextId++;
    const debt = {
        id,
        creditor: creditorId,
        debtor: debtorId,
        amount,
        reason: reason || 'Brak podanego powodu',
        created_at: Math.floor(Date.now() / 1000),
        paid_at: null,
        guild_id: guildId || 'DM'
    };
    debtsData.debts.push(debt);
    saveDebts();
    return debt;
};

const getDebtById = (id) => debtsData.debts.find(d => d.id === id);

const deleteDebt = (id) => {
    debtsData.debts = debtsData.debts.filter(d => d.id !== id);
    saveDebts();
};

const getDebts = (filter = {}) => {
    return debtsData.debts.filter(d => {
        if (filter.guildId && d.guild_id !== filter.guildId) return false;
        if (filter.userId) {
            if (filter.activeOnly && d.paid_at !== null) return false;
            return d.debtor === filter.userId || d.creditor === filter.userId;
        }
        if (filter.activeOnly && d.paid_at !== null) return false;
        if (filter.guild_id && d.guild_id !== filter.guild_id) return false;
        return true;
    });
};

const updateDebt = (id, updates) => {
    const debt = debtsData.debts.find(d => d.id === id);
    if (debt) {
        Object.assign(debt, updates);
        saveDebts();
    }
    return debt;
};

// ------------------- HELPER FUNCTIONS -------------------
const getRandomFrom = arr => arr[Math.floor(Math.random() * arr.length)];
const isValidUser = user => user && typeof user === 'object' && user.id;
const sanitizeInput = (str, maxLen = 500) => String(str).slice(0, maxLen).replace(/[<>]/g, '');
const userMention = user => `<@${user.id || user}>`;

// Rate limiting z czyszczeniem memory leak'ów
const rateLimits = new Map();
const checkRateLimit = (userId, limit = 1, timeframe = 2000) => {
    const key = userId;
    const now = Date.now();
    const userData = rateLimits.get(key) || { count: 0, reset: now + timeframe };
    
    // Czyszczenie starych wpisów co 10 operacji (memory leak fix)
    if (rateLimits.size % 10 === 0) {
        for (const [k, v] of rateLimits.entries()) {
            if (now > v.reset + 60000) { // Usuń jeśli starsze niż 1 minuta od resetu
                rateLimits.delete(k);
            }
        }
    }
    
    if (now > userData.reset) {
        rateLimits.set(key, { count: 1, reset: now + timeframe });
        return true;
    }
    
    if (userData.count >= limit) return false;
    userData.count++;
    return true;
};


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

client.once('ready', async () => {
    console.log(`✅ Zalogowany jako ${client.user.tag}!`);
    console.log(`📊 Bot jest gotowy!`);
    const channel = client.channels.cache.get('1445878372478484540');
    if (!channel) {
        console.log('⚠️ Kanał do powiadomień o commitach nie znaleziony.');
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
                `Nowy commit, kurwa!\n` +
                `**${commitTitle}**\n${commitLink}\n` +
                `Autor: ${commitAuthor} — ${new Date(commitDate).toLocaleString()}`
            );

            fs.writeFileSync('./lastCommit.json', JSON.stringify({ id: commit.sha }));
            console.log(`📤 Wysłano powiadomienie o commicie: ${commitTitle}`);
        } else {
            console.log('📭 Brak nowych commitów.');
        }
    } catch (err) {
        console.error('❌ Błąd pobierania commita:', err.message);
    }
});


// ------------------- LISTA KOMEND -------------------

const commands = [
    //wersja
    new SlashCommandBuilder().setName('wersja').setDescription('Pokazuje wersję bota').setDMPermission(true),
        //fivemowe komendy
    new SlashCommandBuilder().setName('e_kciuk').setDescription('Wysyla zdjecie kciuka').setDMPermission(true),

    new SlashCommandBuilder().setName('e_stopa').setDescription('Wysyla zdjecie stopy').setDMPermission(true),

    new SlashCommandBuilder().setName('e_lezenie').setDescription('Wysyla zdjecie lezenia').setDMPermission(true),

    new SlashCommandBuilder().setName('e_siedzenie').setDescription('Wysyla zdjecie siedzenia').setDMPermission(true),

    new SlashCommandBuilder().setName('e_sory').setDescription('wysyla gifa z przeprosinami').setDMPermission(true),

    // JIGGLE PHYSICS
    new SlashCommandBuilder().setName('jiggle-physics').setDescription('Jiggle hysics dla obrazka').addAttachmentOption(o => o.setName('obrazek').setDescription('Obrazek do przetworzenia').setRequired(true)).setDMPermission(true),
    //co
    new SlashCommandBuilder().setName('co').setDescription('ping').setDMPermission(true),
    //morda
    new SlashCommandBuilder()
        .setName('morda')
        .setDescription('Wyzywa wskazaną osobę')
        .addUserOption(o => o.setName('kto').setDescription('Kogo zwyzywać').setRequired(true))
        .setDMPermission(true),
    //zabierz
    new SlashCommandBuilder()
        .setName('zabierz')
        .setDescription('Zabiera coś komuś')
        .addUserOption(o => o.setName('kto').setDescription('Komu zabrać').setRequired(true))
        .setDMPermission(true),
    // zajeb
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

    // KOLKO I KRZYZYK PVP
    new SlashCommandBuilder()
        .setName('kolkokrzyzyk')
        .setDescription('Gra w kolko i krzyzyk PvP')
        .addUserOption(o => o.setName('przeciwnik').setDescription('Gracz do zagrania').setRequired(true))
        .setDMPermission(true),

    // GRY I ZABAWY
    new SlashCommandBuilder().setName('rzutmoneta').setDescription('Rzut monetą - orzeł lub reszka').setDMPermission(true),

    new SlashCommandBuilder()
        .setName('kostka')
        .setDescription('Rzut kostką')
        .addIntegerOption(o => o.setName('sciany').setDescription('Liczba ścian (domyślnie 6)').setRequired(false))
        .setDMPermission(true),

    new SlashCommandBuilder().setName('papierokamiennozaniec').setDescription('Papier, Kamień, Nożyce vs Bot').setDMPermission(true),

    new SlashCommandBuilder().setName('quiz').setDescription('Quiz z pytaniami').setDMPermission(true),

    new SlashCommandBuilder().setName('8kul').setDescription('Kulka 8 - zadaj pytanie i losuj odpowiedź').setDMPermission(true),

    new SlashCommandBuilder()
        .setName('szansa')
        .setDescription('Ile szans że coś się uda')
        .addIntegerOption(o => o.setName('procent').setDescription('Procent (0-100)').setRequired(false))
        .setDMPermission(true),

    // KODOWANIE
    new SlashCommandBuilder()
        .setName('qr')
        .setDescription('Generuje kod QR z tekstu')
        .addStringOption(o => o.setName('tekst').setDescription('Tekst do zakodowania').setRequired(true))
        .setDMPermission(true),

    new SlashCommandBuilder()
        .setName('base64')
        .setDescription('Koduje/dekoduje Base64')
        .addStringOption(o => o.setName('tekst').setDescription('Tekst do kodowania/dekodowania').setRequired(true))
        .addStringOption(o => o.setName('tryb').setDescription('Tryb: encode (domyślnie) lub decode').setRequired(false).addChoices(
            { name: 'encode', value: 'encode' },
            { name: 'decode', value: 'decode' }
        ))
        .setDMPermission(true),

    // SYSTEM DŁUGÓW
    new SlashCommandBuilder()
        .setName('dlug')
        .setDescription('Zarządzaj długami')
        .addSubcommand(sc => sc
            .setName('dodaj')
            .setDescription('Dodaj dług komuś')
            .addUserOption(o => o.setName('debtor').setDescription('Osoba która ma dług').setRequired(true))
            .addNumberOption(o => o.setName('amount').setDescription('Kwota długu').setRequired(true))
            .addStringOption(o => o.setName('reason').setDescription('Powód długu').setRequired(false))
        )
        .addSubcommand(sc => sc
            .setName('remove')
            .setDescription('Usuń dług')
            .addIntegerOption(o => o.setName('id').setDescription('ID długu').setRequired(true))
        ),

    new SlashCommandBuilder()
        .setName('dlugi')
        .setDescription('Wyświetl wszystkie długi')
        .addUserOption(o => o.setName('user').setDescription('Wyświetl długi danej osoby (opcjonalnie)').setRequired(false)),

    new SlashCommandBuilder()
        .setName('splac')
        .setDescription('Spłać dług')
        .addIntegerOption(o => o.setName('id').setDescription('ID długu do spłacenia').setRequired(true))
        .addNumberOption(o => o.setName('amount').setDescription('Kwota (opcjonalnie, jeśli część)').setRequired(false)),

    new SlashCommandBuilder()
        .setName('bilbord')
        .setDescription('Publikuje aktywny bilbord długów, który odświeża się na bieżąco'),

    new SlashCommandBuilder()
        .setName('bilans')
        .setDescription('Wyświetl bilans długów dla użytkownika')
        .addUserOption(o => o.setName('user').setDescription('Użytkownik (opcjonalnie)').setRequired(false)),
].map(c => c.toJSON());

// ------------------- REJESTR KOMEND -------------------

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('✅ Komendy zarejestrowane pomyślnie!');
    } catch (err) {
        console.error('❌ Błąd rejestracji komend:', err.message);
    }
})();

// ------------------- LOGIKA KOMEND -------------------

// Gry aktywne z timeout'em (memory leak fix)
const tictacGames = new Map();

// Aktywne bilbordy długów
const activeBillboards = new Map();
const BILLBOARD_REFRESH_INTERVAL = 30000;

const buildBillboardEmbed = (guildId) => {
    const debts = getDebts({ guildId, activeOnly: true });
    const totalAmount = debts.reduce((sum, debt) => sum + debt.amount, 0);
    const description = debts.length === 0
        ? '✅ Brak aktywnych długów w tej gildii.'
        : `${debts.length} aktywnych długów • Suma: **${totalAmount} PLN**`;

    const embed = new EmbedBuilder()
        .setColor('#FFD43B')
        .setTitle('🪧 Bilbord długów')
        .setDescription(description)
        .setTimestamp();

    if (debts.length > 0) {
        const lines = debts.slice(0, 10).map(d =>
            `**#${d.id}** <@${d.debtor}> → <@${d.creditor}> • **${d.amount} PLN**\nPowód: ${d.reason}`
        );

        embed.addFields({
            name: '📋 Aktywne długi',
            value: lines.join('\n\n')
        });

        if (debts.length > 10) {
            embed.setFooter({ text: `Pokazano 10 z ${debts.length} długów. Użyj /dlugi, aby zobaczyć pełną listę.` });
        }
    }

    return embed;
};

const registerBillboard = (message) => {
    if (!message.guildId) return;
    activeBillboards.set(`${message.guildId}:${message.channelId}`, {
        guildId: message.guildId,
        channelId: message.channelId,
        messageId: message.id
    });
};

const unregisterBillboard = (guildId, channelId) => {
    activeBillboards.delete(`${guildId}:${channelId}`);
};

const refreshBillboardEntry = async (entry) => {
    const channel = await client.channels.fetch(entry.channelId).catch(() => null);
    if (!channel || !channel.isTextBased()) {
        unregisterBillboard(entry.guildId, entry.channelId);
        return;
    }

    const message = await channel.messages.fetch(entry.messageId).catch(() => null);
    if (!message) {
        unregisterBillboard(entry.guildId, entry.channelId);
        return;
    }

    const embed = buildBillboardEmbed(entry.guildId);
    await message.edit({ embeds: [embed] }).catch(() => {});
};

const refreshBillboardsForGuild = async (guildId) => {
    for (const entry of activeBillboards.values()) {
        if (entry.guildId === guildId) {
            await refreshBillboardEntry(entry).catch(err => console.error('❌ Błąd odświeżania bilbordu:', err.message));
        }
    }
};

setInterval(() => {
    for (const entry of activeBillboards.values()) {
        refreshBillboardEntry(entry).catch(err => console.error('❌ Błąd odświeżania bilbordu:', err.message));
    }
}, BILLBOARD_REFRESH_INTERVAL);

// Cleanup TicTac games co 5 minut
setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    for (const [gameId, game] of tictacGames.entries()) {
        if (now - game.createdAt > 5 * 60 * 1000) { // 5 minut
            tictacGames.delete(gameId);
            cleaned++;
        }
    }
    if (cleaned > 0) console.log(`🧹 Usunięto ${cleaned} starych gier TicTac`);
}, 60000); // Check co 1 minute

client.on('interactionCreate', async i => {
    if (i.isChatInputCommand()) {
        const name = i.commandName;
        const user = i.options?.getUser('kto');
        const targetUser = user || i.user;
        const latency = Date.now() - i.createdTimestamp;

        // E KCIUK
    if (name === 'e_kciuk') {
        try {
            const imageFolder = 'Zdjecia/kciuk'; 
            if (!fs.existsSync(imageFolder)) {
                return i.reply('❌ Folder ze zdjęciami nie istnieje!');
            }
            const images = fs.readdirSync(imageFolder).filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f));
            if (images.length === 0) {
                return i.reply('❌ Brak zdjęć w folderze!');
            }
            const randomImage = images[Math.floor(Math.random() * images.length)];
            return i.reply({ files: [path.join(imageFolder, randomImage)] });
        } catch (err) {
            console.error('❌ Błąd e_kciuk:', err.message);
            return i.reply('❌ Błąd przy wysyłaniu zdjęcia!');
        }
}
        // E STOPA
if (name === 'e_stopa') {
    try {
        const imageFolder = 'Zdjecia/stopa'; 
        if (!fs.existsSync(imageFolder)) {
            return i.reply('❌ Folder ze zdjęciami nie istnieje!');
        }
        const images = fs.readdirSync(imageFolder).filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f));
        if (images.length === 0) {
            return i.reply('❌ Brak zdjęć w folderze!');
        }
        const randomImage = images[Math.floor(Math.random() * images.length)];
        return i.reply({ files: [path.join(imageFolder, randomImage)] });
    } catch (err) {
        console.error('❌ Błąd e_stopa:', err.message);
        return i.reply('❌ Błąd przy wysyłaniu zdjęcia!');
    }
}

        // E LEZENIE
if (name === 'e_lezenie') {
    try {
        const imageFolder = 'Zdjecia/lezenie'; 
        if (!fs.existsSync(imageFolder)) {
            return i.reply('❌ Folder ze zdjęciami nie istnieje!');
        }
        const images = fs.readdirSync(imageFolder).filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f));
        if (images.length === 0) {
            return i.reply('❌ Brak zdjęć w folderze!');
        }
        const randomImage = images[Math.floor(Math.random() * images.length)];
        return i.reply({ files: [path.join(imageFolder, randomImage)] });
    } catch (err) {
        console.error('❌ Błąd e_lezenie:', err.message);
        return i.reply('❌ Błąd przy wysyłaniu zdjęcia!');
    }
}

        // E SIEDZENIE
if (name === 'e_siedzenie') {
    try {
        const imageFolder = 'Zdjecia/siedzenie'; 
        if (!fs.existsSync(imageFolder)) {
            return i.reply('❌ Folder ze zdjęciami nie istnieje!');
        }
        const images = fs.readdirSync(imageFolder).filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f));
        if (images.length === 0) {
            return i.reply('❌ Brak zdjęć w folderze!');
        }
        const randomImage = images[Math.floor(Math.random() * images.length)];
        return i.reply({ files: [path.join(imageFolder, randomImage)] });
    } catch (err) {
        console.error('❌ Błąd e_siedzenie:', err.message);
        return i.reply('❌ Błąd przy wysyłaniu zdjęcia!');
    }
}

        // E SORY
if (name === 'e_sory') {
    try {
        const imageFolder = 'Zdjecia/sory';
        if (!fs.existsSync(imageFolder)) {
            return i.reply('❌ Folder ze zdjęciami nie istnieje!');
        }
        const images = fs.readdirSync(imageFolder).filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f));
        if (images.length === 0) {
            return i.reply('❌ Brak zdjęć w folderze!');
        }
        const randomImage = images[Math.floor(Math.random() * images.length)];
        return i.reply({ files: [path.join(imageFolder, randomImage)] });
    } catch (err) {
        console.error('❌ Błąd e_sory:', err.message);
        return i.reply('❌ Błąd przy wysyłaniu zdjęcia!');
    }
}

        // WERSJA
    if (name === 'wersja') {
        return i.reply(`🤖 Wersja bota: **${BOT_VERSION}**`);
    }

        if (name === 'jiggle-physics') {
        return i.reply('Jiggle physics jest niedostępne, kurwa! daj devowi czas na ogarnięcie tej jebanej funkcji!');
    }
        if (name === 'kolkokrzyzyk') {
            const opponent = i.options.getUser('przeciwnik');
            
            if (opponent.id === i.user.id) {
                return i.reply('Nie możesz grać sam ze sobą, skurwysynu!');
            }

            const gameId = `${i.channelId}-${Date.now()}`;
            
            const board = Array(9).fill('⬜');
            tictacGames.set(gameId, {
                board,
                player1: i.user.id,
                player1Name: i.user.username,
                player2: opponent.id,
                player2Name: opponent.username,
                turn: i.user.id,
                createdAt: Date.now()
            });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId(`ttt_0_${gameId}`).setLabel('1').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`ttt_1_${gameId}`).setLabel('2').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`ttt_2_${gameId}`).setLabel('3').setStyle(ButtonStyle.Secondary)
                );
            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId(`ttt_3_${gameId}`).setLabel('4').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`ttt_4_${gameId}`).setLabel('5').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`ttt_5_${gameId}`).setLabel('6').setStyle(ButtonStyle.Secondary)
                );
            const row3 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId(`ttt_6_${gameId}`).setLabel('7').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`ttt_7_${gameId}`).setLabel('8').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`ttt_8_${gameId}`).setLabel('9').setStyle(ButtonStyle.Secondary)
                );

            return i.reply({
                content: `Kółko i krzyżyk — jebana walka!\n<@${i.user.id}> (⭕) vs <@${opponent.id}> (❌)\nRuch: <@${i.user.id}>\n\`\`\`\n⬜⬜⬜\n⬜⬜⬜\n⬜⬜⬜\n\`\`\``,
                components: [row, row2, row3]
            });
        }

        if (name === 'co') return i.reply(`KURWA GÓWNO!\nPing: ${latency}ms`);

        if (name === 'komendy') {
            let list = commands.map(c => `/${c.name} – ${c.description}`).join('\n');
            return i.reply('Lista komend, kurwa:\n' + list);
        }

        if (name === 'porno') {
            const teksty = [
                `<@${i.user.id}> masz swoje PORNO, kurwa: https://tinyurl.com/freeporn983724623764`,
                `<@${i.user.id}> ty zboczeńcu, idź szukać dalej`,
                `<@${i.user.id}> sam se znajdź, leniu`,
                `Nie dostaniesz PORNO, <@${i.user.id}>, spadaj!`,
                `<@${i.user.id}> znalezisko nr2: https://tinyurl.com/freeporn983724623764`,
                `<@${i.user.id}> przynieś sobie popcorn i idź bez mnie, kurwa`,
                `<@${i.user.id}> twoja lista pornoli jest smutna, popracuj nad nią`,
                `<@${i.user.id}> więcej porno? Serio? Oto link: https://tinyurl.com/freeporn983724623764`,
            ];
            return i.reply(randomFrom(teksty));
        }

        if (name === 'wyruchaj') {
            const teksty = [
                `<@${i.user.id}> wyruchał ${targetUser} z taką siłą, że ten poleciał do innego wymiaru!`,
                `<@${i.user.id}> dał ${targetUser} takiego kopa, że ten wylądował na księżycu!`,
                `<@${i.user.id}> wyruchał ${targetUser} z taką mocą, że ten stracił przytomność na tydzień!`,
                `<@${i.user.id}> dał ${targetUser} takiego łomot, że ten obudził się w szpitalu!`,
                `<@${i.user.id}> wyruchał ${targetUser} z taką siłą, że ten stracił pamięć!`,
                `<@${i.user.id}> dał ${targetUser} takiego kopa, że ten wylądował na innej planecie!`
            ];
            return i.reply(randomFrom(teksty));
        }

        if (name === 'morda') {
            const teksty = [
                `${targetUser} wygląda jak patch notes pisany w Paintcie, kurwa`,
                `${targetUser} to chodzący błąd 404, jebany`,
                `${targetUser} pachnie jak przypalony pendrive, spadaj`,
                `${targetUser} wygląda jak patch notesy po pijaku, kurwa`,
                `${targetUser}, twoja twarz to błąd 404, serio`,
                `${targetUser} śmierdzi jak spalony kabel, brawo`,
                `${targetUser} ma więcej bugów niż twoje życie`,
                `${targetUser} to commit bez testów — katastrofa`,
                `${targetUser} wyglądasz jakbyś debugował w okularach słonecznych`
            ];
            return i.reply(randomFrom(teksty));
        }

        if (name === 'zabierz') {
            const teksty = [
                `<@${i.user.id}> zabrał ${targetUser} wszystko, kurwa!`,
                `<@${i.user.id}> zawojował i zabrał ${targetUser} jego skarby!`,
                `<@${i.user.id}> najechał na ${targetUser} i zabrał mu wszystko!`,
                `<@${i.user.id}> przepchnął ${targetUser} i wziął jego rzeczy!`,
                `<@${i.user.id}> skasował ${targetUser} z ekwipunku!`,
                `<@${i.user.id}> wyrwał ${targetUser} jego najmilszą rzecz!`
            ];
            return i.reply(randomFrom(teksty));
        }

        if (name === 'zajeb') {
            const teksty = [
                `<@${i.user.id}> zajebał ${targetUser} z taką siłą, że ten poleciał do innego wymiaru!`,
                `<@${i.user.id}> dał ${targetUser} takiego kopa, że ten wylądował na księżycu!`,
                `<@${i.user.id}> zajebał ${targetUser} z taką mocą, że ten stracił przytomność na tydzień!`,
                `<@${i.user.id}> dał ${targetUser} takiego łomot, że ten obudził się w szpitalu!`,
                `<@${i.user.id}> zajebał ${targetUser} z taką siłą, że ten stracił pamięć!`,
                `<@${i.user.id}> dał ${targetUser} takiego kopa, że ten wylądował na innej planecie!`
            ];
            return i.reply(randomFrom(teksty));
        }
        // Wkurwianie
        if (name === 'wkurw') {
            const teksty = [
                `<@${i.user.id}> wkurwił ${targetUser}, kurwa!`,
                `<@${i.user.id}> sprawił, że ${targetUser} jest wkurwiony, spadaj!`,
                `<@${i.user.id}> wkurwił ${targetUser} na maksa, kurwa!`,
                `<@${i.user.id}> wkurwił ${targetUser} tak bardzo, że ten chce się wylogować!`,
                `<@${i.user.id}> wkurwił ${targetUser} do tego stopnia, że ten ma ochotę rzucić komputerem!`,
                `<@${i.user.id}> wkurwił ${targetUser} tak bardzo, że ten chce się teleportować do innego serwera!`
            ];
            return i.reply(randomFrom(teksty));
        }
        // LOS
        if (name === 'los') {
            const teksty = [
                `<@${i.user.id}>, los cię dzisiaj kopie w dupę!`,
                `<@${i.user.id}>, pech cię znajdzie!`,
                `<@${i.user.id}>, los jest brutalny!`,
                `<@${i.user.id}>, dziś nie twój dzień, idź spać`,
                `<@${i.user.id}>, coś pójdzie nie tak, przygotuj się`,
                `<@${i.user.id}>, może jutro będzie lepiej, kurwa`
            ];
            return i.reply(randomFrom(teksty));
        }
        // LIŚĆ
        if (name === 'lisc') {
            return i.reply(`<@${i.user.id}> spierdolił liścia ${targetUser}, kurwa!`);
        }
        //LOVE
        if (name === 'love') {
            const teksty = [
                `${targetUser || i.user} jesteś piękny jak jebany stacktrace!`,
                `${targetUser || i.user} świecisz jak monitor, kurwa!`,
                `${targetUser || i.user} jesteś moim słoneczkiem, pierdol się`,
                `${targetUser || i.user}, twoje oczy błyszczą jak błędne logi`,
                `${targetUser || i.user}, moje serce ma leak, tylko dla ciebie`,
                `${targetUser || i.user}, jesteś jak bug, nie mogę cię usunąć`
            ];
            return i.reply(randomFrom(teksty));
        }
        // ROZKURW
        if (name === 'rozkurw') {
            const teksty = [
                `<@${i.user.id}> zrobił taką bekę, że wszyscy umarli ze śmiechu!`,
                `<@${i.user.id}> rozkurwił sytuację do tego stopnia, że wszyscy płaczą ze śmiechu!`,
                `<@${i.user.id}> zrobił taką bekę, że nawet boty się śmieją!`,
                `<@${i.user.id}> rozkurwił sytuację tak bardzo, że wszyscy mają bóle brzucha ze śmiechu!`,
                `<@${i.user.id}> zrobił taką bekę, że wszyscy mają zakwasy od śmiechu!`,
                `<@${i.user.id}> rozkurwił sytuację do tego stopnia, że wszyscy mają skurcze od śmiechu!`
            ];
            return i.reply(randomFrom(teksty));
        }
        // IMPREZA
        if (name === 'impreza') {
            const teksty = [
                `<@${i.user.id}> rozpoczął imprezę, kurwa!`,
                `<@${i.user.id}> zaczyna imprezę, wszyscy na parkiet!`,
                `<@${i.user.id}> odpala imprezę, czas na melanż!`,
                `<@${i.user.id}> rozpoczyna imprezę, niech żyje zabawa!`,
                `<@${i.user.id}> zaczyna imprezę, niech muzyka gra!`,
                `<@${i.user.id}> odpala imprezę, czas na szaleństwo!`
            ];
            return i.reply(randomFrom(teksty));
        }
        // TORCIK
        if (name === 'torcik') {
           const teksty = [
                `<@${i.user.id}> dał ${targetUser} torcik, kurwa!`,
                `<@${i.user.id}> poczęstował ${targetUser} torcikiem, spadaj!`,
                `<@${i.user.id}> wręczył ${targetUser} torcik, kurwa!`,
                `<@${i.user.id}> ofiarował ${targetUser} torcik, spadaj!`,
                `<@${i.user.id}> podarował ${targetUser} torcik, kurwa!`,
                `<@${i.user.id}> przekazał ${targetUser} torcik, spadaj!`
            ];
            return i.reply(randomFrom(teksty));
        }

        // RZUT MONETĄ
        if (name === 'rzutmoneta') {
            const wynik = Math.random() > 0.5 ? 'Orzeł 🦅' : 'Reszka 💲';
            return i.reply(`<@${i.user.id}> rzucił monetą, kurwa...\n**${wynik}**`);
        }
        // RZUT KOSTKĄ
        if (name === 'kostka') {
            const sciany = i.options?.getInteger('sciany') || 6;
            if (sciany < 2 || sciany > 100) {
                return i.reply('Kostka musi mieć 2-100 ścian!');
            }
            const wynik = Math.floor(Math.random() * sciany) + 1;
            return i.reply(`🎲 <@${i.user.id}> rzucił kostką d${sciany}, kurwa...\n**Wynik: ${wynik}**`);
        }
        // PAPIER KAMIEŃ NOŻYCE
        if (name === 'papierokamiennozaniec') {
    const opcje = ['Papier 📄', 'Kamień 🪨', 'Nożyce ✂️'];

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId(`pkn_papier_${i.user.id}`).setLabel('Papier 📄').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`pkn_kamien_${i.user.id}`).setLabel('Kamień 🪨').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`pkn_nozyce_${i.user.id}`).setLabel('Nożyce ✂️').setStyle(ButtonStyle.Primary)
        );

    return i.reply({
        content: 'Wybieraj, kurwa:',
        components: [row]
    });
}
        // QUIZ
        if (name === 'quiz') {
            const quizzes = [
                { q: 'Ile jest kontinentów?', a: 'siedem', wrongAnswers: ['osiem', 'sześć'] },
                { q: 'Jaka jest stolica Polski?', a: 'warszawa', wrongAnswers: ['kraków', 'wrocław'] },
                { q: 'Ile wynosi 2+2?', a: 'cztery', wrongAnswers: ['pięć', 'trzy'] },
                { q: 'Jaki jest największy ocean?', a: 'spokojny', wrongAnswers: ['atlantycki', 'indyjski'] }
            ];
            
            const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];
            const answers = [quiz.a, ...quiz.wrongAnswers].sort(() => Math.random() - 0.5);
            const buttons = answers.map((ans, idx) => {
                const isCorrect = ans === quiz.a ? 'correct' : 'wrong';
                return new ButtonBuilder()
                    .setCustomId(`quiz_${isCorrect}_${idx}`)
                    .setLabel(ans)
                    .setStyle(ButtonStyle.Primary);
            });

            const row = new ActionRowBuilder().addComponents(buttons);
            
            return i.reply({
                content: `❓ **${quiz.q}** — odpowiedz, kurwa:`,
                components: [row],
                ephemeral: false
            });
        }
        // KULKA 8
        if (name === '8kul') {
            const odpowiedzi = [
                'Tak 👍',
                'Nie 👎',
                'Może później 🤷',
                'Wyglądów dobrze ✨',
                'Na pewno nie ❌',
                'Zdecydowanie tak ✅',
                'Nie wiem 🤔',
                'Czekaj sram, zakręć jeszcze raz 💩',
                'Czekaj, najebany jestem 🍺',
                'Los mówi: spierdalaj! 🚀' 
            ];
            const wynik = odpowiedzi[Math.floor(Math.random() * odpowiedzi.length)];
            return i.reply(`🎱 Kulka 8 pierdoli:\n**${wynik}**`);
        }

        if (name === 'szansa') {
            const procent = i.options?.getInteger('procent') ?? Math.floor(Math.random() * 101);
            if (procent < 0 || procent > 100) {
                return i.reply('Procent musi być między 0 a 100!');
            }
            
            const szansa = Math.random() * 100;
            const wynik = szansa <= procent ? '✅ SIĘ UDA!' : '❌ SIĘ NIE UDA!';
            return i.reply(`<@${i.user.id}> szansa: **${procent}%**\nLos: ${Math.floor(szansa)}%\n${wynik}`);
        }

        // KODOWANIE QR
        if (name === 'qr') {
            const tekst = i.options.getString('tekst');
            if (tekst.length > 500) {
                return i.reply('Tekst jest za długi! Maksymalnie 500 znaków.');
            }

            try {
                const qrPath = `qr_${Date.now()}.png`;
                await QRCode.toFile(qrPath, tekst, {
                    errorCorrectionLevel: 'H',
                    type: 'image/png',
                    width: 300,
                    margin: 1,
                    color: { dark: '#000000', light: '#FFFFFF' }
                });

                await i.reply({
                    content: `📱 Kod QR dla: \`${tekst}\``,
                    files: [qrPath]
                });

                fs.unlinkSync(qrPath);
            } catch (err) {
                return i.reply(`❌ Błąd generowania QR: ${err.message}`);
            }
        }

        // KODOWANIE BASE64
        if (name === 'base64') {
            const tekst = i.options.getString('tekst');
            const tryb = i.options.getString('tryb') || 'encode';

            try {
                if (tryb === 'encode') {
                    const encoded = Buffer.from(tekst).toString('base64');
                    return i.reply(`🔐 Base64 (encode):\n\`\`\`\n${encoded}\n\`\`\``);
                } else {
                    const decoded = Buffer.from(tekst, 'base64').toString('utf-8');
                    return i.reply(`🔓 Base64 (decode):\n\`\`\`\n${decoded}\n\`\`\``);
                }
            } catch (err) {
                return i.reply(`❌ Błąd kodowania Base64: ${err.message}`);
            }
        }

        // SYSTEM DŁUGÓW - DODAJ DŁUG
        if (name === 'dlug') {
            const subcommand = i.options.getSubcommand();
            
            if (!checkRateLimit(i.user.id, 5, 5000)) {
                return i.reply({ content: '⏳ Zbyt wiele żądań! Czekaj przed następną komendą.', ephemeral: true });
            }

            if (subcommand === 'dodaj') {
                try {
                    const debtor = i.options.getUser('debtor');
                    const amount = i.options.getNumber('amount');
                    const reason = i.options.getString('reason') || 'Brak podanego powodu';

                    if (amount <= 0) {
                        return i.reply('❌ Kwota musi być większa niż 0!');
                    }
                    if (amount > 1000000) {
                        return i.reply('❌ Kwota jest zbyt duża!');
                    }

                    if (debtor.id === i.user.id) {
                        return i.reply('❌ Nie możesz mieć długu wobec samego siebie, kretynie!');
                    }

                    const debt = addDebt(i.user.id, debtor.id, amount, reason, i.guildId || 'DM');

                    const embed = new EmbedBuilder()
                        .setColor('#FF6B6B')
                        .setTitle('✅ Dług dodany!')
                        .addFields(
                            { name: '💳 Wierzyciel', value: `<@${i.user.id}>`, inline: true },
                            { name: '👤 Dłużnik', value: `<@${debtor.id}>`, inline: true },
                            { name: '💰 Kwota', value: `${amount} PLN`, inline: true },
                            { name: '📝 Powód', value: reason, inline: false },
                            { name: '🆔 ID Długu', value: `#${debt.id}`, inline: true }
                        )
                        .setTimestamp();

                    const reply = await i.reply({ embeds: [embed] });
                    await refreshBillboardsForGuild(i.guildId || 'DM');
                    return reply;
                } catch (err) {
                    console.error('❌ Błąd dodawania długu:', err.message);
                    return i.reply('❌ Błąd przy dodawaniu długu!');
                }
            }

            if (subcommand === 'remove') {
                try {
                    const id = i.options.getInteger('id');
                    
                    const debt = getDebtById(id);
                    if (!debt || debt.guild_id !== (i.guildId || 'DM')) {
                        return i.reply('❌ Dług nie znaleziony!');
                    }

                    if (debt.creditor !== i.user.id) {
                        return i.reply('❌ Nie możesz usunąć długu, którego nie powinieś!');
                    }

                    deleteDebt(id);
                    await refreshBillboardsForGuild(i.guildId || 'DM');
                    return i.reply(`✅ Dług #${id} usunięty!`);
                } catch (err) {
                    console.error('❌ Błąd usuwania długu:', err.message);
                    return i.reply('❌ Błąd przy usuwaniu długu!');
                }
            }
        }

        // DLUGI - WYŚWIETL WSZYSTKIE
        if (name === 'dlugi') {
            try {
                if (!checkRateLimit(i.user.id, 3, 3000)) {
                    return i.reply({ content: '⏳ Zbyt wiele żądań!', ephemeral: true });
                }

                const userId = i.options.getUser('user')?.id || null;
                let debts;

                if (userId) {
                    debts = getDebts({ 
                        userId, 
                        guildId: i.guildId || 'DM',
                        activeOnly: true 
                    });
                } else {
                    debts = getDebts({ 
                        guildId: i.guildId || 'DM',
                        activeOnly: true 
                    });
                }

                if (debts.length === 0) {
                    return i.reply(userId ? `✅ Brak długów dla <@${userId}>!` : '✅ Brak aktywnych długów!');
                }

                const embed = new EmbedBuilder()
                    .setColor('#4ECDC4')
                    .setTitle('📋 Lista Długów')
                    .setDescription(debts.map((d, idx) => 
                        `**#${d.id}** | <@${d.debtor}> → <@${d.creditor}> | 💰 **${d.amount} PLN** | Powód: ${d.reason}`
                    ).join('\n'))
                    .setTimestamp();

                return i.reply({ embeds: [embed] });
            } catch (err) {
                console.error('❌ Błąd wyświetlania długów:', err.message);
                return i.reply('❌ Błąd!');
            }
        }

        // SPLAC - SPŁAĆ DŁUG
        if (name === 'splac') {
            try {
                if (!checkRateLimit(i.user.id, 5, 5000)) {
                    return i.reply({ content: '⏳ Zbyt wiele żądań!', ephemeral: true });
                }

                const id = i.options.getInteger('id');
                const partialAmount = i.options.getNumber('amount') || null;

                const debt = getDebtById(id);
                
                if (!debt || debt.guild_id !== (i.guildId || 'DM')) {
                    return i.reply('❌ Dług nie znaleziony!');
                }

                if (debt.debtor !== i.user.id) {
                    return i.reply('❌ Nie możesz spłacić długu, który nie dotyczy Ciebie!');
                }

                if (debt.paid_at) {
                    return i.reply('✅ Ten dług już został spłacony!');
                }

                if (partialAmount) {
                    if (partialAmount <= 0 || partialAmount > debt.amount) {
                        return i.reply('❌ Nieprawidłowa kwota!');
                    }

                    const newAmount = debt.amount - partialAmount;
                    if (newAmount <= 0) {
                        updateDebt(id, { paid_at: Math.floor(Date.now() / 1000) });
                        const response = await i.reply(`✅ Dług #${id} całkowicie spłacony!`);
                        await refreshBillboardsForGuild(i.guildId || 'DM');
                        return response;
                    } else {
                        updateDebt(id, { amount: newAmount });
                        const response = await i.reply(`✅ Spłacono ${partialAmount} PLN! Pozostało: ${newAmount} PLN`);
                        await refreshBillboardsForGuild(i.guildId || 'DM');
                        return response;
                    }
                } else {
                    updateDebt(id, { paid_at: Math.floor(Date.now() / 1000) });
                    const response = await i.reply(`✅ Dług #${id} całkowicie spłacony! 🎉`);
                    await refreshBillboardsForGuild(i.guildId || 'DM');
                    return response;
                }
            } catch (err) {
                console.error('❌ Błąd spłacania długu:', err.message);
                return i.reply('❌ Błąd!');
            }
        }

        // BILBORD - AKTYWNY BILBORD DŁUGÓW
        if (name === 'bilbord') {
            if (!i.guildId) {
                return i.reply({ content: 'Bilbord działa tylko na serwerze.', ephemeral: true });
            }

            const embed = buildBillboardEmbed(i.guildId);
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('billboard_refresh').setLabel('Odśwież teraz').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('billboard_stop').setLabel('Zakończ bilbord').setStyle(ButtonStyle.Danger)
            );

            const message = await i.reply({ embeds: [embed], components: [row], fetchReply: true });
            registerBillboard(message);
            return message;
        }

        // BILANS - POKAŻ BILANS
        if (name === 'bilans') {
            try {
                if (!checkRateLimit(i.user.id, 3, 3000)) {
                    return i.reply({ content: '⏳ Zbyt wiele żądań!', ephemeral: true });
                }

                const userId = i.options.getUser('user')?.id || i.user.id;
                const debts = getDebts({ 
                    guildId: i.guildId || 'DM',
                    activeOnly: true 
                });
                
                const owes = debts
                    .filter(d => d.debtor === userId && !d.paid_at)
                    .reduce((sum, d) => sum + d.amount, 0);

                const owed = debts
                    .filter(d => d.creditor === userId && !d.paid_at)
                    .reduce((sum, d) => sum + d.amount, 0);

                const balance = owed - owes;

                const embed = new EmbedBuilder()
                    .setColor(balance > 0 ? '#51CF66' : balance < 0 ? '#FF6B6B' : '#FFD43B')
                    .setTitle(`💰 Bilans Długów - <@${userId}>`)
                    .addFields(
                        { name: '📤 Dług do oddania', value: `${owes} PLN`, inline: true },
                        { name: '📥 Dług do otrzymania', value: `${owed} PLN`, inline: true },
                        { name: '⚖️ Bilans', value: balance > 0 ? `+${balance} PLN (masz)` : balance < 0 ? `${balance} PLN (masz dług)` : 'Wyrównane ✅', inline: true }
                    )
                    .setTimestamp();

                return i.reply({ embeds: [embed] });
            } catch (err) {
                console.error('❌ Błąd bilansu:', err.message);
                return i.reply('❌ Błąd!');
            }
        }
    }

    // Obsługa przycisków
    if (i.isButton()) {
        const [action, ...rest] = i.customId.split('_');
        
        // TIC TAC TOE
        if (action === 'ttt') {
            const [index, gameId] = rest;
            
            const game = tictacGames.get(gameId);
            if (!game) return i.reply({ content: 'Gra wygasła, spierdalaj!', ephemeral: true });

            // Sprawdzenie czyjej kolei
            if (game.turn !== i.user.id) {
                return i.reply({ content: 'Nie Twoja kolej, spierdalaj!', ephemeral: true });
            }

            const idx = parseInt(index);
            if (game.board[idx] !== '⬜') {
                return i.reply({ content: 'Pole zajęte, nie kombinuj!', ephemeral: true });
            }

            // Ruch gracza
            const symbol = game.turn === game.player1 ? '⭕' : '❌';
            game.board[idx] = symbol;

            // Sprawdzenie wygranej
            const checkWin = (board) => {
                const lines = [
                    [0, 1, 2], [3, 4, 5], [6, 7, 8], // wiersze
                    [0, 3, 6], [1, 4, 7], [2, 5, 8], // kolumny
                    [0, 4, 8], [2, 4, 6] // przekątne
                ];
                
                for (let line of lines) {
                    if (board[line[0]] !== '⬜' &&
                        board[line[0]] === board[line[1]] &&
                        board[line[1]] === board[line[2]]) {
                        return board[line[0]];
                    }
                }
                return null;
            };

            const winner = checkWin(game.board);
            const isBoardFull = !game.board.includes('⬜');

            if (winner) {
                tictacGames.delete(gameId);
                const winnerName = winner === '⭕' ? game.player1Name : game.player2Name;
                const boardStr = `${game.board[0]}${game.board[1]}${game.board[2]}\n${game.board[3]}${game.board[4]}${game.board[5]}\n${game.board[6]}${game.board[7]}${game.board[8]}`;
                
                return i.update({
                    content: `🎉 **${winnerName}** rozjebał grę i wygrał!\n\`\`\`\n${boardStr}\n\`\`\``,
                    components: []
                });
            }

            if (isBoardFull) {
                tictacGames.delete(gameId);
                const boardStr = `${game.board[0]}${game.board[1]}${game.board[2]}\n${game.board[3]}${game.board[4]}${game.board[5]}\n${game.board[6]}${game.board[7]}${game.board[8]}`;
                
                return i.update({
                    content: `🤝 Kurwa, remis!\n\`\`\`\n${boardStr}\n\`\`\``,
                    components: []
                });
            }

            // Zmiana tury
            game.turn = game.turn === game.player1 ? game.player2 : game.player1;

            const boardStr = `${game.board[0]}${game.board[1]}${game.board[2]}\n${game.board[3]}${game.board[4]}${game.board[5]}\n${game.board[6]}${game.board[7]}${game.board[8]}`;
            const nextPlayer = game.turn === game.player1 ? game.player1Name : game.player2Name;
            const nextSymbol = game.turn === game.player1 ? '⭕' : '❌';

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId(`ttt_0_${gameId}`).setLabel('1').setStyle(ButtonStyle.Secondary).setDisabled(game.board[0] !== '⬜'),
                    new ButtonBuilder().setCustomId(`ttt_1_${gameId}`).setLabel('2').setStyle(ButtonStyle.Secondary).setDisabled(game.board[1] !== '⬜'),
                    new ButtonBuilder().setCustomId(`ttt_2_${gameId}`).setLabel('3').setStyle(ButtonStyle.Secondary).setDisabled(game.board[2] !== '⬜')
                );
            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId(`ttt_3_${gameId}`).setLabel('4').setStyle(ButtonStyle.Secondary).setDisabled(game.board[3] !== '⬜'),
                    new ButtonBuilder().setCustomId(`ttt_4_${gameId}`).setLabel('5').setStyle(ButtonStyle.Secondary).setDisabled(game.board[4] !== '⬜'),
                    new ButtonBuilder().setCustomId(`ttt_5_${gameId}`).setLabel('6').setStyle(ButtonStyle.Secondary).setDisabled(game.board[5] !== '⬜')
                );
            const row3 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId(`ttt_6_${gameId}`).setLabel('7').setStyle(ButtonStyle.Secondary).setDisabled(game.board[6] !== '⬜'),
                    new ButtonBuilder().setCustomId(`ttt_7_${gameId}`).setLabel('8').setStyle(ButtonStyle.Secondary).setDisabled(game.board[7] !== '⬜'),
                    new ButtonBuilder().setCustomId(`ttt_8_${gameId}`).setLabel('9').setStyle(ButtonStyle.Secondary).setDisabled(game.board[8] !== '⬜')
                );

            return i.update({
                content: `Kółko i krzyżyk — jebana walka!\n<@${game.player1}> (⭕) vs <@${game.player2}> (❌)\nRuch: <@${game.turn}> (${nextSymbol})\n\`\`\`\n${boardStr}\n\`\`\``,
                components: [row, row2, row3]
            });
        }

        // PAPIER KAMIEŃ NOŻYCE
        if (action === 'pkn') {
            const [choice, userId] = rest;
            
            if (i.user.id !== userId) {
                return i.reply({ content: 'To nie Twoja gra, spierdalaj!', ephemeral: true });
            }

            const choices = { papier: '📄', kamien: '🪨', nozyce: '✂️' };
            const botChoices = ['papier', 'kamien', 'nozyce'];
            const botChoice = botChoices[Math.floor(Math.random() * botChoices.length)];

            const results = {
                papier: { kamien: 'Papier zakrywa Kamień! 🎉 WYGRAŁEŚ, kurwa!', nozyce: 'Nożyce tną Papier! ❌ PRZEGRAŁEŚ, spierdalaj!', papier: 'Remis, kurwa! 🤝' },
                kamien: { nozyce: 'Kamień tępe Nożyce! 🎉 WYGRAŁEŚ, kurwa!', papier: 'Papier zakrywa Kamień! ❌ PRZEGRAŁEŚ, spierdalaj!', kamien: 'Remis, kurwa! 🤝' },
                nozyce: { papier: 'Nożyce tną Papier! 🎉 WYGRAŁEŚ, kurwa!', kamien: 'Kamień tępe Nożyce! ❌ PRZEGRAŁEŚ, spierdalaj!', nozyce: 'Remis, kurwa! 🤝' }
            };

            return i.reply(`${choices[choice]} vs ${choices[botChoice]}\n${results[choice][botChoice]}`);
        }

        // QUIZ
        if (action === 'quiz') {
            const [result, index] = rest;
            if (result === 'correct') {
                return i.reply('✅ Poprawna odpowiedź, kurwa! Brawo!');
            } else {
                return i.reply('❌ Zła odpowiedź, spadaj! To nie było takie trudne...');
            }
        }

        
    }

});

// ------------------- ERROR HANDLING -------------------

// Zmienna do śledzenia ostatniego kanału
let lastChannel = null;

client.on('messageCreate', msg => {
    if (!msg.author.bot) {
        lastChannel = msg.channel;
    }
});

client.on('error', err => console.error('❌ Client error:', err));

process.on('unhandledRejection', async err => {
    console.error('❌ Unhandled rejection:', err);
    if (lastChannel) {
        try {
            await lastChannel.send('💥 Wyjebalem sie, zaraz wstane');
        } catch (e) {}
    }
});

process.on('uncaughtException', async err => {
    console.error('❌ Uncaught exception:', err);
    if (lastChannel) {
        try {
            await lastChannel.send('💥 Wyjebalem sie, zaraz wstane');
        } catch (e) {}
    }
    process.exit(1);
});

// ------------------- LOGOWANIE -------------------

console.log('🚀 Bot startuje...');
client.login(process.env.DISCORD_TOKEN);
