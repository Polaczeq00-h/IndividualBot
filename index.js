import 'dotenv/config';
import fs from 'fs';
import axios from 'axios';
import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, ChannelType, Partials } from 'discord.js';

// --- KLIENT I INTENTY ---

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel] 
});

client.once('clientReady', async (c) => {
    console.log(`Zalogowany jako ${c.user.tag}!`);

    const channel = client.channels.cache.get('1445670513153413203');
    if (!channel) return console.log('Nie znalazłem kanału, pajacu.');

    // Pobieramy ostatni commit z GitHub
    try {
        const owner = process.env.GITHUB_OWNER || 'Polaczeq00-h';
        const repo = process.env.GITHUB_REPO || 'IndividualBot';
        const branch = process.env.GITHUB_BRANCH || 'main';

        const response = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/commits/${branch}`,
            {
                headers: process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {}
            }
        );

        const commit = response.data;
        const commitTitle = commit.commit.message.split('\n')[0];
        const commitLink = commit.html_url;
        const commitAuthor = commit.commit.author.name;
        const commitDate = commit.commit.author.date;

        // Sprawdzamy czy jest już zapisany ostatni commit ID
        let lastCommitId = '';
        try {
            const data = JSON.parse(fs.readFileSync('./lastCommit.json', 'utf-8'));
            lastCommitId = data.id;
        } catch {}

        // Jeśli to nowy commit, wysyłamy wiadomość
        if (lastCommitId !== commit.sha) {
            const message = `Update działa, kurwa. @everyone\nOstatni commit:\n**${commitTitle}**\n${commitLink}\n\n*Autor: ${commitAuthor}*\n*Data: ${new Date(commitDate).toLocaleString()}*`;
            await channel.send(message);

            // Zapisujemy nowy commit ID
            fs.writeFileSync('./lastCommit.json', JSON.stringify({ id: commit.sha }));
            console.log(`✅ Wysłano commit: ${commitTitle}`);
        } else {
            console.log('Brak nowych commitów.');
        }
    } catch (err) {
        console.error('❌ Błąd pobierania commita z GitHub:', err.message);
    }
});




// ------------------- KOMENDY -------------------
const commands = [
    new SlashCommandBuilder().setName('co').setDescription('Odpowiada gówno i pokazuje latency').setDMPermission(true),
    new SlashCommandBuilder().setName('morda').setDescription('Wyzywa wskazaną osobę').addUserOption(o => o.setName('kto').setDescription('Kogo zwyzywać').setRequired(true)).setDMPermission(true), 
    new SlashCommandBuilder().setName('zabierz').setDescription('Zabiera coś komuś').addUserOption(o => o.setName('kto').setDescription('Komu zabrać').setRequired(true)).setDMPermission(true),
    new SlashCommandBuilder().setName('zajeb').setDescription('Daje mocne jebnięcie komuś').addUserOption(o => o.setName('kto').setDescription('Komu').setRequired(true)).setDMPermission(true),
    new SlashCommandBuilder().setName('wkurw').setDescription('Wkurwia kogoś').addUserOption(o => o.setName('kto').setDescription('Kogo').setRequired(true)).setDMPermission(true),
    new SlashCommandBuilder().setName('los').setDescription('Losuje losowo cokolwiek wkurwiającego').addUserOption(o => o.setName('kto').setDescription('Dla kogo losować').setRequired(true)).setDMPermission(true),
    new SlashCommandBuilder().setName('lisc').setDescription('Wysyła losowego liścia').addUserOption(o => o.setName('kto').setDescription('Komu dać liścia').setRequired(true)).setDMPermission(true),
    new SlashCommandBuilder().setName('love').setDescription('Losowy komplement miłosny').addUserOption(o => o.setName('kto').setDescription('Komu dać komplement').setRequired(false)).setDMPermission(true),
    new SlashCommandBuilder().setName('rozkurw').setDescription('Rozkurwia sytuację').setDMPermission(true),
    new SlashCommandBuilder().setName('impreza').setDescription('Opisuje imprezę').setDMPermission(true),
    new SlashCommandBuilder().setName('torcik').setDescription('Daje torcik komuś').addUserOption(o => o.setName('kto').setDescription('Komu dać torcik').setRequired(true)).setDMPermission(true),
    new SlashCommandBuilder().setName('wyruchaj').setDescription('Losowo wyrycha kogoś').addUserOption(o => o.setName('kto').setDescription('Kogo wyrychać').setRequired(true)).setDMPermission(true),
    new SlashCommandBuilder().setName('porno').setDescription('Wysyła losowe PORNO').setDMPermission(true),
    new SlashCommandBuilder().setName('komendy').setDescription('Wyświetla listę komend').setDMPermission(true)
].map(c => c.toJSON());

// ------------------- LOGIKA INTERAKCJI -------------------

client.on('interactionCreate', async i => {
    // 1. Walidacja: Upewnij się, że to jest komenda slash.
    if (!i.isChatInputCommand()) return;

    // 2. POPRAWKA DM: Użycie ChannelType.DM
    if (i.channel && i.channel.type === ChannelType.DM) { 
        console.log(`[DM OK] Odebrano komendę slash '/${i.commandName}' w Wiadomości Prywatnej od użytkownika ${i.user.tag}.`);
    }

    const name = i.commandName;
    // Zmieniamy user na i.user.username
    const user = i.options?.getUser('kto');

    const targetUser = user || i.user;

    const randomFrom = arr => arr[Math.floor(Math.random() * arr.length)];
    const latency = Date.now() - i.createdTimestamp;

    // --- LOGIKA KOMEND ---
    
    if (name === 'co') {
        return i.reply(`Gówno \nLatency: ${latency}ms`);
    }
    
    // Walidacja użycia na serwerze (pominięta, ponieważ targetUser i tak jest zdefiniowany)
    // if (!i.inGuild() && !user && name !== 'co' && name !== 'rozkurw' && name !== 'impreza' && name !== 'los') { ... }
    if (name === 'komendy') {
    // Tworzymy listę komend dynamicznie
    const lista = commands.map(c => `/${c.name} - ${c.description}`);
    return i.reply(['Lista komend bota:', ...lista].join('\n'));
}
    if (name === 'porno') {
        const teksty = [
            `<@${i.user.id}>, Oto twoje losowe PORNO: https://tinyurl.com/freeporn983724623764`,
            `<@${i.user.id}>Ty jakiś zjebany jesteś?`,
            `<@${i.user.id}>Szukaj sam, nie jestem twoją kurwą!`,
            `<@${i.user.id}>Nie dostaniesz PORNO ode mnie!`,
            `<@${i.user.id}>Idź do diabła z tym PORNO!`,
            `<@${i.user.id}>Nie mam zamiaru ci dawać PORNO!`,
            `<@${i.user.id}>Szukaj gdzie indziej, nie tutaj!`,
            `<@${i.user.id}>Nie jestem twoim dostawcą PORNO!`,
            `<@${i.user.id}>Nie licz na mnie w sprawie PORNO!`,
            `<@${i.user.id}>Idź się leczyć z tym PORNO!`,
            `Nie dostaniesz PORNO ode mnie, <@${i.user.id}>!`,
            `<@${i.user.id}>, wykupił subskrypcję na PORNO!`,
            `<@${i.user.id}>, szukał PORNO w Google!`,
            `<@${i.user.id}>, próbował znaleźć PORNO na TikToku!`,
            `<@${i.user.id}>, szukał PORNO na Instagramie!`,
            `<@${i.user.id}>, próbował znaleźć PORNO na Facebooku!`,
            `<@${i.user.id}>, szukał PORNO na Twitterze!`,
            `<@${i.user.id}>, próbował znaleźć PORNO na Reddit!`
        ];
        return i.reply(randomFrom(teksty));
    }
if (name === 'wyruchaj') {
        const teksty = [
            `<@${i.user.id}>Losowo wyruchał ${targetUser}!`,
            `<@${i.user.id}>Znalazł okazję, by wyruchać ${targetUser}!`,
            `<@${i.user.id}>Postanowił wyruchać ${targetUser} bez powodu!`,
            `<@${i.user.id}>Nie mógł się powstrzymać i wyruchał ${targetUser}!`,
            `<@${i.user.id}>Zaskoczył wszystkich, ruchając ${targetUser}!`,
            `<@${i.user.id}>Wykorzystał moment i wyruchał ${targetUser}!`,
            `<@${i.user.id}>Spontanicznie wyruchał ${targetUser}!`,
            `<@${i.user.id}>Zdecydował się na wyruchanie ${targetUser}!`,
            `<@${i.user.id}>Nieoczekiwanie wyruchał ${targetUser}!`,
            `<@${i.user.id}>Zaskoczył wszystkich, wyruchując ${targetUser}!`,
            `<@${i.user.id}>Wyruchał ${targetUser} w najbardziej nieoczekiwany sposób!`,
            `<@${i.user.id}>Losowo wyruchał ${targetUser} w tajemnicy!`,
            `<@${i.user.id}>Znalazł idealny moment, by wyruchać ${targetUser} w ukryciu!`,
            `<@${i.user.id}>Postanowił wyruchać ${targetUser} w niecodzienny sposób!`,
            `<@${i.user.id}>Znalazł idealny moment, by wyruchać ${targetUser}!`,
            `<@${i.user.id}>Nie mógł się oprzeć i wyruchał ${targetUser}!`,
            `<@${i.user.id}>Zaskoczył wszystkich, wyruchując ${targetUser} w tajemnicy!`,
            `<@${i.user.id}>Spontanicznie wyruchał ${targetUser} na oczach wszystkich!`,
            `<@${i.user.id}>Zdecydował się na wyruchanie ${targetUser} w nietypowy sposób!`,
            `<@${i.user.id}>Nieoczekiwanie wyruchał ${targetUser} w środku nocy!`,
            `<@${i.user.id}>Zaskoczył wszystkich, wyruchując ${targetUser} w najbardziej nieoczekiwanym momencie!`
        ];
        return i.reply(randomFrom(teksty));
    }
    if (name === 'morda') {
        const teksty = [
            `${targetUser} wygląda jak patch notesy po pijaku`,
            `${targetUser}, twoja twarz to błąd 404`,
            `${targetUser} ma aurę Windowsa XP po formacie`,
            `${targetUser} wygląda jakby wstał w złym DLC`,
            `${targetUser} śmierdzi jak spalony kabel`,
            `${targetUser} jest jak bug, którego nikt nie zgłosi`,
            `${targetUser} ma vibe beta-testera życia`,
            `${targetUser} wygląda jakby jadł tylko fast food`,
            `${targetUser} jest bardziej toksyczny niż mój router`,
            `${targetUser} wygląda jakby spał w serwerowni`,
            `${targetUser} ma twarz jak 404 not found`,
            `${targetUser} świeci jak monitor CRT`,
            `${targetUser} ma styl jak nieudany update`,
            `${targetUser} wygląda jakby grał w życie na easy`,
            `${targetUser} jest bardziej zgniły niż banana w koszu`,
            `${targetUser} ma aura Windowsa 98`,
            `${targetUser} wygląda jak patch po patchu`,
            `${targetUser} jest jak bug bez stacktrace`,
            `${targetUser} świeci jak LED, ale popsuty`,
            `${targetUser} wygląda jakby nie zaktualizował życia od 2010`
        ];
        return i.reply(randomFrom(teksty));
    }

    if (name === 'zabierz') {
        const teksty = [
            `<@${i.user.id}>Zabrał godność ${targetUser}`,
            `<@${i.user.id}>Zabrał honor ${targetUser}`,
            `<@${i.user.id}>Zabrał ostatni pierdolony cukierek od ${targetUser}`,
            `<@${i.user.id}>Zabrał szacunek od ${targetUser}`,
            `<@${i.user.id}>Zabrał marzenia od ${targetUser}`,
            `<@${i.user.id}>Zabrał nadzieję od ${targetUser}`,
            `<@${i.user.id}>Zabrał radość od ${targetUser}`,
            `<@${i.user.id}>Zabrał władzę od ${targetUser}`,
            `<@${i.user.id}>Zabrał energię życiową od ${targetUser}`,
            `<@${i.user.id}>Zabrał uśmiech od ${targetUser}`,
            `<@${i.user.id}>Zabrał humor od ${targetUser}`,
            `<@${i.user.id}>Zabrał złudzenia od ${targetUser}`,
            `<@${i.user.id}>Zabrał talent od ${targetUser}`,
            `<@${i.user.id}>Zabrał kreatywność od ${targetUser}`,
            `<@${i.user.id}>Zabrał portfel od ${targetUser}`,
            `<@${i.user.id}>Zabrał telefon od ${targetUser}`,
            `<@${i.user.id}>Zabrał zegarek od ${targetUser}`,
            `<@${i.user.id}>Zabrał klucze od ${targetUser}`,
            `<@${i.user.id}>Zabrał jedzenie od ${targetUser}`,
            `<@${i.user.id}>Zabrał tlen od ${targetUser}`
        ];
        return i.reply(randomFrom(teksty));
    }

    if (name === 'zajeb') {
        const teksty = [
            `${targetUser} dostał solidny wpierdol`,
            `${targetUser} oberwał jak kurwa`,
            `${targetUser} wylądował na ziemi`,
            `${targetUser} dostał po ryju`,
            `${targetUser} oberwał mocniej niż kabel w ścianie`,
            `${targetUser} dostał jak bug w patchu`,
            `${targetUser} oberwał jak serwer w crashu`,
            `${targetUser} dostał wpierdol epicki`,
            `${targetUser} oberwał jak CPU po OC`,
            `${targetUser} dostał po dupie`,
            `${targetUser} oberwał w twarz`,
            `${targetUser} oberwał jak laptop bez baterii`,
            `${targetUser} dostał w głowę`,
            `${targetUser} oberwał w klatę`,
            `${targetUser} oberwał jak update systemu`,
            `${targetUser} dostał w nogi`,
            `${targetUser} oberwał jak troll w internecie`,
            `${targetUser} oberwał mocniej niż kabel USB`,
            `${targetUser} oberwał jak bug w kodzie`,
            `${targetUser} oberwał jak serwerownia w nocy`
        ];
        return i.reply(randomFrom(teksty));
    }

    if (name === 'wkurw') {
        const teksty = [
            `${targetUser} jest wkurwiony jak piekarnik`,
            `${targetUser} dostał wkurw`,
            `${targetUser} wkurwił wszystkich wokół`,
            `${targetUser} wkurw jak CPU po OC`,
            `${targetUser} jest wkurwiony jak bug w patchu`,
            `${targetUser} wkurwił się mocniej niż kabel w ścianie`,
            `${targetUser} dostał wkurw epicki`,
            `${targetUser} wkurwił jak serwer w crashu`,
            `${targetUser} wkurwił się jak monitor CRT`,
            `${targetUser} jest wkurwiony jak router`,
            `${targetUser} dostał wkurw jak patch notes`,
            `${targetUser} wkurwił się jak laptop bez baterii`,
            `${targetUser} dostał wkurw w głowę`,
            `${targetUser} wkurwił się w klatę`,
            `${targetUser} wkurwił jak troll w internecie`,
            `${targetUser} wkurwił się jak bug w kodzie`,
            `${targetUser} wkurwił się mocniej niż USB`,
            `${targetUser} wkurwił jak update systemu`,
            `${targetUser} dostał wkurw w nogi`,
            `${targetUser} wkurwił wszystkich w okolicy`
        ];
        return i.reply(randomFrom(teksty));
    }

    if (name === 'los') {
        const teksty = [
            `<@${i.user.id}>, Los cię jebnie w dupę dzisiaj!`,
            `<@${i.user.id}>, Dzisiaj los cię wkurwi`,
            `<@${i.user.id}>, Nie wiadomo jak, ale coś spierdolisz`,
            `<@${i.user.id}>, Wkurwiasz wszystkich wokół 😎`,
            `<@${i.user.id}>, Dzisiaj pech cię znajdzie`,
            `<@${i.user.id}>, Los cię wyśle na wkurw`,
            `<@${i.user.id}>, Nie wiadomo co się stanie, ale jebanie pewne`,
            `<@${i.user.id}>, Dzisiaj wszystko spierdolisz`,
            `<@${i.user.id}>, Los cię kopie w dupę`,
            `<@${i.user.id}>, Nie licz na szczęście, gnoju`,
            `<@${i.user.id}>, Los wkurwia dzisiaj mocno`,
            `<@${i.user.id}>, Kurde, los dzisiaj jebie`,
            `<@${i.user.id}>, Nie ma nadziei, los wkurwia`,
            `<@${i.user.id}>, Dzisiaj jesteś ofiarą losu`,
            `<@${i.user.id}>, Los wybrał ciebie`,
            `<@${i.user.id}>, Pech cię znajdzie`,
            `<@${i.user.id}>, Los jest brutalny`,
            `<@${i.user.id}>, Dzisiaj jebanie pewne`,
            `<@${i.user.id}>, Nie licz na nic, gnoju`,
            `<@${i.user.id}>, Los działa bez litości`
        ];
        return i.reply(randomFrom(teksty));
    }

    if (name === 'lisc') {
        const teksty = [
            `${targetUser}, dostałeś liścia od <@${i.user.id}>!`,
            `${targetUser}, liść wpadł w twarz od <@${i.user.id}>!`,
            `liść trafił ${targetUser}`,
            `${targetUser}, oberwałeś takim liściem że aż echo poszło od <@${i.user.id}>!`,
            `${targetUser}, ten liść był tak szybki że aż czas się zatrzymał od <@${i.user.id}>!`,
            `${targetUser}, ten liść był jak pocisk z kosmosu od <@${i.user.id}>!`,
            `${targetUser}, liść oberwał ciebie od <@${i.user.id}>!`,
            `${targetUser}, liscieć uderzył cię z prędkością światła od <@${i.user.id}>!`,
            `${targetUser}, to był liść z innej planety od <@${i.user.id}>!`,
            `${targetUser}, liść uderzył cię z taką siłą że aż ziemia zadrżała od <@${i.user.id}>!`,
            `${targetUser}, liść jak od samego boga od <@${i.user.id}>!`,
            `${targetUser}, wykurwisty liść trafił cię prosto w twarz od <@${i.user.id}>!`,
            `${targetUser}, liść spadł na ciebie jak grom z jasnego nieba od <@${i.user.id}>!`,
            `${targetUser}, lisciasty liść uderzył cię z taką mocą że aż gwiazdy zgasły od <@${i.user.id}>!`,
            `${targetUser}, lisciasty liść trafił cię z taką siłą że aż powietrze zawirowało od <@${i.user.id}>!`,
            `${targetUser}, dostal taki wpierdol ze krecik mu sie kręci od <@${i.user.id}>!`,
            `${targetUser}, ten lisc byl tak mocny ze twoj numer buta zna cale miasto od <@${i.user.id}>!`,
            `${targetUser}, od tego liscia nos ci krwawi od <@${i.user.id}>!`,
            `${targetUser}, od tego liścia nie uciekniesz od <@${i.user.id}>!`,
            `${targetUser}, dostal taki wpierdol ze myślisz że to huragan od <@${i.user.id}>!`,
            `${targetUser}, dostal eś liścia jak burza od <@${i.user.id}>!`,
            `${targetUser}, dostales tak mocno że myślisz że to tornado od <@${i.user.id}>!`
        ];
        return i.reply(randomFrom(teksty));
    }

    if (name === 'love') {
        const teksty = [
            `${targetUser} jesteś moim słoneczkiem`,
            `${targetUser} kocham cię jak bugi w kodzie`,
            `${targetUser} jesteś epicki`,
            `${targetUser} wyglądasz jak patch notes`,
            `${targetUser} jesteś piękny jak stacktrace`,
            `${targetUser} masz vibe tryhard`,
            `${targetUser} świecisz jak monitor`,
            `${targetUser} jesteś jak bug w systemie`,
            `${targetUser} epickość w czystej formie`,
            `${targetUser} piękno lvl hard`,
            `${targetUser} kocham cię mocno`,
            `${targetUser} jesteś boski`,
            `${targetUser} masz urok jak update`,
            `${targetUser} epicki człowiek`,
            `${targetUser} jesteś jak laptop bez baterii`,
            `${targetUser} kocham cię jak router`,
            `${targetUser} epicki jak patch`,
            `${targetUser} jesteś legendarny`,
            `${targetUser} epickość bez granic`,
            `${targetUser} piękno lvl expert`,
            `${targetUser} jesteś moim życiem`,
        ];
        return i.reply(randomFrom(teksty));
    }

    if (name === 'rozkurw') {
        const teksty = [
            'Rozkurw wszędzie!',
            'Rozkurw w toku',
            'Rozkurw epicki',
            'Rozkurw hardcore',
            'Rozkurw z przytupem',
            'Rozkurw lvl hard',
            'Rozkurw lvl expert',
            'Rozkurw w głowie',
            'Rozkurw w dupie',
            'Rozkurw w nogi',
            'Rozkurw w klatę',
            'Rozkurw jak bug',
            'Rozkurw jak patch',
            'Rozkurw epickie',
            'Rozkurw hardcore 2.0',
            'Rozkurw z humorem',
            'Rozkurw w toku 2.0',
            'Rozkurw na maxa',
            'Rozkurw epicki lvl',
            'Rozkurw dla wszystkich'
        ];
        return i.reply(randomFrom(teksty));
    }

    if (name === 'impreza') {
        const teksty = [
            'Impreza w toku!',
            'Impreza epicka',
            'Impreza hardcore',
            'Impreza z przytupem',
            'Impreza lvl hard',
            'Impreza lvl expert',
            'Impreza w głowie',
            'Impreza w dupie',
            'Impreza w nogi',
            'Impreza w klatę',
            'Impreza jak bug',
            'Impreza jak patch',
            'Impreza epickie',
            'Impreza hardcore 2.0',
            'Impreza z humorem',
            'Impreza w toku 2.0',
            'Impreza na maxa',
            'Impreza epicki lvl',
            'Impreza dla wszystkich',
            'Impreza bez końca'
        ];
        return i.reply(randomFrom(teksty));
    }

    if (name === 'torcik') {
        const teksty = [
            `Torcik dla ${targetUser} od <@${i.user.id}>`,
            `Daję torcik dla  ${targetUser} od <@${i.user.id}>`,
            `Podarowałem torcik dla  ${targetUser} od <@${i.user.id}>`,
            `Torcik trafił do ${targetUser} od <@${i.user.id}>`,
            `Torcik dla Ciebie, ${targetUser} od <@${i.user.id}>`,
            `Smaczny torcik dla  ${targetUser} od <@${i.user.id}>`,
            `Torcik wpadł do rąk ${targetUser} od <@${i.user.id}>`,
            `Torcik dla bohatera ${targetUser} od <@${i.user.id}>`,
            `Torcik specjalnie dla ${targetUser} od <@${i.user.id}>`,
            `Torcik z humorem dla ${targetUser} od <@${i.user.id}>`,
            `Torcik dla najlepszego ${targetUser} od <@${i.user.id}>`,
            `Torcik z miłością dla ${targetUser} od <@${i.user.id}>`,
            `Torcik dla epickiego ${targetUser} od <@${i.user.id}>`,
            `Torcik dla legendarnego ${targetUser} od <@${i.user.id}>`,
            `Torcik dla wkurwionego ${targetUser} od <@${i.user.id}>`,
            `Torcik dla słoneczka o imieniu: ${targetUser} od <@${i.user.id}>`,
            `Torcik dla tryhard dla ${targetUser} od <@${i.user.id}>`,
            `Torcik lvl hard dla ${targetUser} od <@${i.user.id}>`,
            `Torcik lvl expert dla ${targetUser} od <@${i.user.id}>`,
            `Torcik dla wszystkich!`
        ];
        return i.reply(randomFrom(teksty));
    }
}); // <--- KONIEC BLOKU client.on('interactionCreate') JEST TUTAJ!

// ------------------- REJESTRACJA I LOGIN -------------------

if (!process.env.DISCORD_TOKEN) throw new Error('Brakuje DISCORD_TOKEN w .env');
if (!process.env.CLIENT_ID) throw new Error('Brakuje CLIENT_ID w .env');

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function registerCommands() {
    try {
        // Rejestracja globalna
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log('Zarejestrowano komendy globalne.');
    } catch (err) {
        console.error('Błąd przy rejestracji komend:', err);
    }
}

registerCommands();

client.login(process.env.DISCORD_TOKEN).then(() => console.log('Bot zalogowany!'))
.catch(err => console.error('Token jest jebnięty', err));