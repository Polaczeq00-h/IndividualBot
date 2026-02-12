import 'dotenv/config';
import fs from 'fs';
import pkg from './package.json' assert { type: 'json' };
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
    ActionRowBuilder
} from 'discord.js';


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
    new SlashCommandBuilder().setName('e kciuk').setDescription('Wysyla zdjecie kciuka').setDMPermission(true),

    new SlashCommandBuilder().setName('e stopa').setDescription('Wysyla zdjecie stopy').setDMPermission(true),

    new SlashCommandBuilder().setName('e lezenie').setDescription('Wysyla zdjecie lezenia').setDMPermission(true),

    new SlashCommandBuilder().setName('e siedzenie').setDescription('Wysyla zdjecie siedzenia').setDMPermission(true),

    new SlashCommandBuilder().setName('e sory').setDescription('wysyla gifa z przeprosinami').setDMPermission(true),

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

    new SlashCommandBuilder().setName('impreza').setDescription('Rozpoczyna imprezę kurwa').setDMPermission(true),

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

// Gry aktywne
const tictacGames = new Map();

client.on('interactionCreate', async i => {
    if (i.isChatInputCommand()) {
        const name = i.commandName;
        const user = i.options?.getUser('kto');
        const targetUser = user || i.user;
        const randomFrom = arr => arr[Math.floor(Math.random() * arr.length)];
        const latency = Date.now() - i.createdTimestamp;
        //obsluga komend

        // E KCIUK
    if (name === 'e kciuk') {
        const imageFolder = 'Zdjecia/kciuk'; 
        const images = fs.readdirSync(imageFolder).filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f));
        const randomImage = images[Math.floor(Math.random() * images.length)];
        return i.reply({ files: [path.join(imageFolder, randomImage)] });
}
        // E STOPA
if (name === 'e stopa') {
    const imageFolder = 'Zdjecia/stopa'; 
    const images = fs.readdirSync(imageFolder).filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f));
    const randomImage = images[Math.floor(Math.random() * images.length)];
    return i.reply({ files: [path.join(imageFolder, randomImage)] });
}

        // E LEZENIE
if (name === 'e lezenie') {
    const imageFolder = 'Zdjecia/lezenie'; 
    const images = fs.readdirSync(imageFolder).filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f));
    const randomImage = images[Math.floor(Math.random() * images.length)];
    return i.reply({ files: [path.join(imageFolder, randomImage)] });
}

        // E SIEDZENIE
if (name === 'e siedzenie') {
    const imageFolder = 'Zdjecia/siedzenie'; 
    const images = fs.readdirSync(imageFolder).filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f));
    const randomImage = images[Math.floor(Math.random() * images.length)];
    return i.reply({ files: [path.join(imageFolder, randomImage)] });
}

        // E SORY
if (name === 'e sory') {
    const imageFolder = 'Zdjecia/sory';
    const images = fs.readdirSync(imageFolder).filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f));
    const randomImage = images[Math.floor(Math.random() * images.length)];
    return i.reply({ files: [path.join(imageFolder, randomImage)] });
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
                turn: i.user.id
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
                `${targetUser} śmierdzi jak spalony kabel, brawo`
            ,
                `${targetUser} ma więcej bugów niż twoje życie`,
                `${targetUser} to commit bez testów — katastrofa`,
                `${targetUser} wyglądasz jakbyś debugował w okularach słonecznych`
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
        if (name === 'beka') {
            const teksty = [
                `<@${i.user.id}> zrobił taką bekę, że wszyscy umarli ze śmiechu!`,
                `<@${i.user.id}> rozkurwił sytuację do tego stopnia, że wszyscy płaczą ze śmiechu!`,
                `<@${i.user.id}> zrobił taką bekę, że nawet boty się śmieją!`,
                `<@${i.user.id}> rozkurwił sytuację tak bardzo, że wszyscy mają skurwysyńskie bóle brzucha ze śmiechu!`,
                `<@${i.user.id}> zrobił taką bekę, że wszyscy mają skurwysyńskie zakwasy od śmiechu!`,
                `<@${i.user.id}> rozkurwił sytuację do tego stopnia, że wszyscy mają skurwysyńskie skurcze od śmiechu!`
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
            const buttons = answers.map((ans, i) => 
            
                new ButtonBuilder()
                .setCustomId(`quiz_${i}`)
                .setLabel(ans)
                .setStyle(ButtonStyle.Primary)
);

            const row = new ActionRowBuilder().addComponents(buttons);
            
            return i.reply({
                content: `❓ **${quiz.q}** — odpowiedz, kurwa:`,
                components: [row]
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
            const [result] = rest;
            return i.reply(result === 'correct' ? '✅ Poprawna odpowiedź, kurwa!' : '❌ Zła odpowiedź, spadaj!');
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
