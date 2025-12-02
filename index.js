import 'dotenv/config';
import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } from 'discord.js';

// --- KLIENT I INTENTY ---

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent],
    partials: ['CHANNEL']
});

// ------------------- KOMENDY (Poprawiono setRequired na false) -------------------

const commands = [
    new SlashCommandBuilder().setName('co').setDescription('Odpowiada gówno i pokazuje latency').setDMPermission(true),
    new SlashCommandBuilder().setName('morda').setDescription('Wyzywa wskazaną osobę').addUserOption(o => o.setName('kto').setDescription('Kogo zwyzywać').setRequired(false)).setDMPermission(true), 
    new SlashCommandBuilder().setName('zabierz').setDescription('Zabiera coś komuś').addUserOption(o => o.setName('kto').setDescription('Komu zabrać').setRequired(false)).setDMPermission(true),
    new SlashCommandBuilder().setName('zajeb').setDescription('Daje mocne jebnięcie komuś').addUserOption(o => o.setName('kto').setDescription('Komu').setRequired(false)).setDMPermission(true),
    new SlashCommandBuilder().setName('wkurw').setDescription('Wkurwia kogoś').addUserOption(o => o.setName('kto').setDescription('Kogo').setRequired(false)).setDMPermission(true),
    new SlashCommandBuilder().setName('jebanie').setDescription('Opisuje jebnięcie').addUserOption(o => o.setName('kto').setDescription('Kogo').setRequired(false)).setDMPermission(true),
    new SlashCommandBuilder().setName('los').setDescription('Losuje losowo cokolwiek wkurwiającego').addUserOption(o => o.setName('kto').setDescription('Dla kogo losować').setRequired(false)).setDMPermission(true),
    new SlashCommandBuilder().setName('lisc').setDescription('Wysyła losowego liścia').addUserOption(o => o.setName('kto').setDescription('Komu dać liścia').setRequired(false)).setDMPermission(true),
    new SlashCommandBuilder().setName('love').setDescription('Losowy komplement miłosny').addUserOption(o => o.setName('kto').setDescription('Komu dać komplement').setRequired(false)).setDMPermission(true),
    new SlashCommandBuilder().setName('rozkurw').setDescription('Rozkurwia sytuację').setDMPermission(true),
    new SlashCommandBuilder().setName('impreza').setDescription('Opisuje imprezę').setDMPermission(true),
    new SlashCommandBuilder().setName('torcik').setDescription('Daje torcik komuś').addUserOption(o => o.setName('kto').setDescription('Komu dać torcik').setRequired(false)).setDMPermission(true),
].map(c => c.toJSON());

// ------------------- LOGIKA INTERAKCJI -------------------

client.on('interactionCreate', async i => {
    // 1. Walidacja: Upewnij się, że to jest komenda slash.
    if (!i.isChatInputCommand()) return;

    // 2. POPRAWKA ANTY-BŁĘDOWA I LOGOWANIE DM:
    if (i.channel && i.channel.type === 1) { 
        console.log(`[DM OK] Odebrano komendę slash '/${i.commandName}' w Wiadomości Prywatnej od użytkownika ${i.user.tag}.`);
    }

    const name = i.commandName;
    const user = i.options?.getUser('kto');

    // Używamy podanego użytkownika, a jeśli jest null (DM), używamy użytkownika wywołującego
    const targetUser = user || i.user; 

    const randomFrom = arr => arr[Math.floor(Math.random() * arr.length)];
    const latency = Date.now() - i.createdTimestamp;

    if (name === 'co') {
        return i.reply(`Gówno \nLatency: ${latency}ms`);
    }
        
    // Walidacja użycia na serwerze (można ją pominąć, targetUser i tak jest zdefiniowany)
    if (!i.inGuild() && !user && name !== 'co' && name !== 'rozkurw' && name !== 'impreza' && name !== 'los') {
        // Logika pominięta - targetUser już to obsługuje.
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
            `Zabrałem godność ${targetUser}`,
            `Zabrałem honor ${targetUser}`,
            `Zabrałem ostatni pierdolony cukierek od ${targetUser}`,
            `Zabrałem szacunek od ${targetUser}`,
            `Zabrałem marzenia od ${targetUser}`,
            `Zabrałem nadzieję od ${targetUser}`,
            `Zabrałem radość od ${targetUser}`,
            `Zabrałem władzę od ${targetUser}`,
            `Zabrałem energię życiową od ${targetUser}`,
            `Zabrałem uśmiech od ${targetUser}`,
            `Zabrałem humor od ${targetUser}`,
            `Zabrałem złudzenia od ${targetUser}`,
            `Zabrałem talent od ${targetUser}`,
            `Zabrałem kreatywność od ${targetUser}`,
            `Zabrałem portfel od ${targetUser}`,
            `Zabrałem telefon od ${targetUser}`,
            `Zabrałem zegarek od ${targetUser}`,
            `Zabrałem klucze od ${targetUser}`,
            `Zabrałem jedzenie od ${targetUser}`,
            `Zabrałem tlen od ${targetUser}`
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

    if (name === 'jebanie') {
        const teksty = [
            `${targetUser} wyruchał wszystko na swojej drodze`,
            `${targetUser} jebie jak szalony`,
            `${targetUser} ma jebanie na maxa`,
            `${targetUser} jebie jak bug w kodzie`,
            `${targetUser} jebie jak patch notes`,
            `${targetUser} jebie jak serwer w crashu`,
            `${targetUser} jebie jak laptop bez baterii`,
            `${targetUser} jebie jak update systemu`,
            `${targetUser} jebie jak troll w internecie`,
            `${targetUser} jebie jak kabel USB po przepięciu`,
            `${targetUser} jebie jak CPU po OC`,
            `${targetUser} jebie jak monitor CRT`,
            `${targetUser} jebie jak router po restarcie`,
            `${targetUser} jebie jak szalony!!!`,
            `${targetUser} jebie jak nigdy wcześniej`,
            `${targetUser} jebie jakby jutra miało nie być`,

        ];
        return i.reply(randomFrom(teksty));
    }

    if (name === 'los') {
        const teksty = [
            'Los cię jebnie w dupę dzisiaj!',
            'Nie wiadomo jak, ale coś spierdolisz',
            'Wkurwiasz wszystkich wokół 😎',
            'Dzisiaj pech cię znajdzie',
            'Los cię wyśle na wkurw',
            'Nie wiadomo co się stanie, ale jebanie pewne',
            'Dzisiaj wszystko spierdolisz',
            'Los cię kopie w dupę',
            'Nie licz na szczęście, gnoju',
            'Los wkurwia dzisiaj mocno',
            'Dzisiaj jebanie w toku',
            'Kurde, los dzisiaj jebie',
            'Nie ma nadziei, los wkurwia',
            'Dzisiaj jesteś ofiarą losu',
            'Los wybrał ciebie',
            'Pech cię znajdzie',
            'Los jest brutalny',
            'Dzisiaj jebanie pewne',
            'Nie licz na nic, gnoju',
            'Los działa bez litości'
        ];
        return i.reply(randomFrom(teksty));
    }

    if (name === 'lisc') {
        const teksty = [
            `${targetUser}, dostałeś liścia!`,
            `${targetUser}, liść wpadł w twarz`,
            `${targetUser}, liść przykrył twoją głowę`,
            `${targetUser}, liść frunie w powietrzu`,
            `liść trafił ${targetUser}`,
            `${targetUser}, oberwałeś takim liściem że aż echo poszło`,
            `${targetUser}, ten liść był tak szybki że aż czas się zatrzymał`,
            `${targetUser}, ten liść był jak pocisk z kosmosu`,
            `${targetUser}, liść oberwał ciebie`,
            `${targetUser}, liscieć uderzył cię z prędkością światła`,
            `${targetUser}, to był liść z innej planety`,
            `${targetUser}, liść uderzył cię z taką siłą że aż ziemia zadrżała`,
            `${targetUser}, liść jak od samego boga`,
            `${targetUser}, wykurwisty liść trafił cię prosto w twarz`,
            `${targetUser}, liść spadł na ciebie jak grom z jasnego nieba`,
            `${targetUser}, lisciasty liść uderzył cię z taką mocą że aż gwiazdy zgasły`,
            `${targetUser}, lisciasty liść trafił cię z taką siłą że aż powietrze zawirowało`,
            `${targetUser}, dostal taki wpierdol ze kreciki mu sie kreci`,
            `${targetUser}, ten lisc byl tak mocny ze twoj numer buta zna cale miasto`,
            `${targetUser}, od tego liscia nos ci krwawi`,
            `${targetUser}, od tego liścia nie uciekniesz`,
            `${targetUser}, dostal taki wpierdol ze myślisz że to huragan`,
            `${targetUser}, dostal eś liścia jak burza`,
            `${targetUser}, dostales tak mocno że myślisz że to tornado`
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
            `Torcik dla ${targetUser}`,
            `Daję torcik dla  ${targetUser}`,
            `Podarowałem torcik dla  ${targetUser}`,
            `Torcik trafił do ${targetUser}`,
            `Torcik dla Ciebie, ${targetUser}`,
            `Smaczny torcik dla  ${targetUser}`,
            `Torcik wpadł do rąk ${targetUser}`,
            `Torcik dla bohatera ${targetUser}`,
            `Torcik specjalnie dla ${targetUser}`,
            `Torcik z humorem dla ${targetUser}`,
            `Torcik dla najlepszego ${targetUser}`,
            `Torcik z miłością dla ${targetUser}`,
            `Torcik dla epickiego ${targetUser}`,
            `Torcik dla legendarnego ${targetUser}`,
            `Torcik dla wkurwionego ${targetUser}`,
            `Torcik dla słoneczka o imieniu: ${targetUser}`,
            `Torcik dla tryhard dla ${targetUser}`,
            `Torcik lvl hard dla ${targetUser}`,
            `Torcik lvl expert dla ${targetUser}`,
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