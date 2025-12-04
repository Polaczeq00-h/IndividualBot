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

    // KOLKO I KRZYZYK PVP
    new SlashCommandBuilder()
        .setName('kolkokrzyzyk')
        .setDescription('Gra w kolko i krzyzyk PvP')
        .addUserOption(o => o.setName('przeciwnik').setDescription('Gracz do zagrania').setRequired(true))
        .setDMPermission(true),

    // RESET
    new SlashCommandBuilder().setName('reset').setDescription('Resetuje bota').setDMPermission(true),

    // GRY I ZABAWY
    new SlashCommandBuilder().setName('rzutmoneta').setDescription('Rzut monetą - orzeł lub reszka').setDMPermission(true),

    new SlashCommandBuilder()
        .setName('kostka')
        .setDescription('Rzut kostką')
        .addIntegerOption(o => o.setName('sciany').setDescription('Liczba ścian (domyślnie 6)').setRequired(false))
        .setDMPermission(true),

    new SlashCommandBuilder().setName('papierokamiennozaniec').setDescription('Papier, Kamień, Nożyce vs Bot').setDMPermission(true),

    new SlashCommandBuilder().setName('wisielec').setDescription('Gra w wisielca').setDMPermission(true),

    new SlashCommandBuilder().setName('quiz').setDescription('Quiz z pytaniami').setDMPermission(true),

    new SlashCommandBuilder().setName('8kul').setDescription('Magic 8-ball - pytaj i losuj odpowiedź').setDMPermission(true),

    new SlashCommandBuilder()
        .setName('szansa')
        .setDescription('Ile szans że coś się uda')
        .addIntegerOption(o => o.setName('procent').setDescription('Procent (0-100)').setRequired(false))
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
        console.log('Komendy zarejestrowane!');
    } catch (err) {
        console.error('Błąd rejestracji komend:', err);
    }
})();

// ------------------- LOGIKA KOMEND -------------------

// Gry aktywne
const tictacGames = new Map();

client.on('interactionCreate', async i => {
    // Obsługa slash komend
    if (i.isChatInputCommand()) {
        const name = i.commandName;
        const user = i.options?.getUser('kto');
        const targetUser = user || i.user;
        const randomFrom = arr => arr[Math.floor(Math.random() * arr.length)];
        const latency = Date.now() - i.createdTimestamp;

        if (name === 'kolkokrzyzyk') {
            const opponent = i.options.getUser('przeciwnik');
            
            if (opponent.id === i.user.id) {
                return i.reply('Nie możesz grać sam ze sobą, głupcze!');
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
                content: `Kolko i Krzyzyk PvP!\n<@${i.user.id}> (⭕) vs <@${opponent.id}> (❌)\nRuch: <@${i.user.id}>\n\`\`\`\n⬜⬜⬜\n⬜⬜⬜\n⬜⬜⬜\n\`\`\``,
                components: [row, row2, row3]
            });
        }

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
                `${targetUser} pachnie jak przypalony pendrive`,
                `${targetUser} wygląda jak patch notesy po pijaku`,
                `${targetUser}, twoja twarz to błąd 404`,
                `${targetUser} śmierdzi jak spalony kabel`
            ];
            return i.reply(randomFrom(teksty));
        }

        if (name === 'zajeb') {
            return i.reply(`${targetUser} dostał solidny wpierdol od <@${i.user.id}>!`);
        }

        if (name === 'wkurw') {
            return i.reply(`${targetUser} jest wkurwiony przez <@${i.user.id}>!`);
        }

        if (name === 'los') {
            const teksty = [
                `<@${i.user.id}>, los cię dzisiaj kopie w dupę!`,
                `<@${i.user.id}>, pech cię znajdzie!`,
                `<@${i.user.id}>, los jest brutalny!`
            ];
            return i.reply(randomFrom(teksty));
        }

        if (name === 'lisc') {
            return i.reply(`<@${i.user.id}> wysłał liścia do ${targetUser}!`);
        }

        if (name === 'love') {
            const teksty = [
                `${targetUser || i.user} jesteś piękny jak stacktrace!`,
                `${targetUser || i.user} świecisz jak monitor!`,
                `${targetUser || i.user} jesteś moim słoneczkiem!`
            ];
            return i.reply(randomFrom(teksty));
        }

        if (name === 'rozkurw') {
            return i.reply('Rozkurw wszędzie!');
        }

        if (name === 'impreza') {
            return i.reply('Impreza w toku!');
        }

        if (name === 'torcik') {
            return i.reply(`🎂 <@${i.user.id}> daje torcik do ${targetUser}!`);
        }

        if (name === 'reset') {
            console.log(`🔄 Reset bota przez ${i.user.username}`);
            await i.reply('Reset pomyślny');
            process.exit(0);
        }

        // GRY I ZABAWY
        if (name === 'rzutmoneta') {
            const wynik = Math.random() > 0.5 ? 'Orzeł 🦅' : 'Reszka 🪙';
            return i.reply(`<@${i.user.id}> rzucił monetą...\n**${wynik}**`);
        }

        if (name === 'kostka') {
            const sciany = i.options?.getInteger('sciany') || 6;
            if (sciany < 2 || sciany > 100) {
                return i.reply('Kostka musi mieć 2-100 ścian!');
            }
            const wynik = Math.floor(Math.random() * sciany) + 1;
            return i.reply(`🎲 <@${i.user.id}> rzucił kostką d${sciany}...\n**Wynik: ${wynik}**`);
        }

        if (name === 'papierokamiennozaniec') {
            const opcje = ['Papier 📄', 'Kamień 🪨', 'Nożyce ✂️'];
            const botChoice = opcje[Math.floor(Math.random() * opcje.length)];
            
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId(`pkn_papier_${i.user.id}`).setLabel('Papier 📄').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`pkn_kamien_${i.user.id}`).setLabel('Kamień 🪨').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`pkn_nozyce_${i.user.id}`).setLabel('Nożyce ✂️').setStyle(ButtonStyle.Primary)
                );

            return i.reply({
                content: `<@${i.user.id}> vs Bot\nBot wybrał: **${botChoice}**\nWybierz swoją opcję:`,
                components: [row]
            });
        }

        if (name === 'wisielec') {
            const slowa = ['JAVASCRIPT', 'DISCORD', 'NODEJS', 'JAVASCRIPT', 'GITHUB', 'TELEGRAM', 'PYTHON'];
            const slowo = slowa[Math.floor(Math.random() * slowa.length)];
            const gameId = `hangman_${i.user.id}_${Date.now()}`;
            
            tictacGames.set(gameId, {
                word: slowo,
                guessed: [],
                wrong: 0,
                type: 'hangman'
            });

            const display = slowo.split('').map(c => tictacGames.get(gameId).guessed.includes(c) ? c : '_').join(' ');
            return i.reply(`🎮 Wisielec!\nSłowo: ${display}\nBłędy: 0/6`);
        }

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
                new ButtonBuilder().setCustomId(`quiz_${ans === quiz.a ? 'correct' : 'wrong'}_${i}`).setLabel(ans).setStyle(ans === quiz.a ? ButtonStyle.Success : ButtonStyle.Danger)
            );
            
            const row = new ActionRowBuilder().addComponents(buttons);
            
            return i.reply({
                content: `❓ **${quiz.q}**`,
                components: [row]
            });
        }

        if (name === '8kul') {
            const odpowiedzi = [
                'Tak 👍',
                'Nie 👎',
                'Może później 🤷',
                'Wyglądów dobrze ✨',
                'Na pewno nie ❌',
                'Zdecydowanie tak ✅',
                'Nie wiem 🤔',
                'Chwileczka... 🎱'
            ];
            const wynik = odpowiedzi[Math.floor(Math.random() * odpowiedzi.length)];
            return i.reply(`🎱 Magic 8-ball odpowiada:\n**${wynik}**`);
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
    }

    // Obsługa przycisków
    if (i.isButton()) {
        const [action, ...rest] = i.customId.split('_');
        
        // TIC TAC TOE
        if (action === 'ttt') {
            const [index, gameId] = rest;
            
            const game = tictacGames.get(gameId);
            if (!game) return i.reply({ content: 'Gra wygasła!', ephemeral: true });

            // Sprawdzenie czyjej kolei
            if (game.turn !== i.user.id) {
                return i.reply({ content: 'Nie Twoja kolej!', ephemeral: true });
            }

            const idx = parseInt(index);
            if (game.board[idx] !== '⬜') {
                return i.reply({ content: 'Pole zajęte!', ephemeral: true });
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
                    content: `🎉 **${winnerName}** wygrał!\n\`\`\`\n${boardStr}\n\`\`\``,
                    components: []
                });
            }

            if (isBoardFull) {
                tictacGames.delete(gameId);
                const boardStr = `${game.board[0]}${game.board[1]}${game.board[2]}\n${game.board[3]}${game.board[4]}${game.board[5]}\n${game.board[6]}${game.board[7]}${game.board[8]}`;
                
                return i.update({
                    content: `🤝 Remis!\n\`\`\`\n${boardStr}\n\`\`\``,
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
                content: `Kolko i Krzyzyk PvP!\n<@${game.player1}> (⭕) vs <@${game.player2}> (❌)\nRuch: <@${game.turn}> (${nextSymbol})\n\`\`\`\n${boardStr}\n\`\`\``,
                components: [row, row2, row3]
            });
        }

        // PAPIER KAMIEŃ NOŻYCE
        if (action === 'pkn') {
            const [choice, userId] = rest;
            
            if (i.user.id !== userId) {
                return i.reply({ content: 'To nie Twoja gra!', ephemeral: true });
            }

            const choices = { papier: '📄', kamien: '🪨', nozyce: '✂️' };
            const botChoices = ['papier', 'kamien', 'nozyce'];
            const botChoice = botChoices[Math.floor(Math.random() * botChoices.length)];

            const results = {
                papier: { kamien: 'Papier zakrywa Kamień! 🎉 WYGRAŁEŚ!', nozyce: 'Nożyce tną Papier! ❌ PRZEGRAŁEŚ!', papier: 'Remis! 🤝' },
                kamien: { nozyce: 'Kamień tępe Nożyce! 🎉 WYGRAŁEŚ!', papier: 'Papier zakrywa Kamień! ❌ PRZEGRAŁEŚ!', kamien: 'Remis! 🤝' },
                nozyce: { papier: 'Nożyce tną Papier! 🎉 WYGRAŁEŚ!', kamien: 'Kamień tępe Nożyce! ❌ PRZEGRAŁEŚ!', nozyce: 'Remis! 🤝' }
            };

            return i.reply(`${choices[choice]} vs ${choices[botChoice]}\n${results[choice][botChoice]}`);
        }

        // QUIZ
        if (action === 'quiz') {
            const [result] = rest;
            return i.reply(result === 'correct' ? '✅ Poprawna odpowiedź!' : '❌ Zła odpowiedź!');
        }
    }

});

// ------------------- LOGOWANIE -------------------

client.login(process.env.DISCORD_TOKEN);
