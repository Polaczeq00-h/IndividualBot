import 'dotenv/config';
// Wprowadzono Partials i ChannelType
import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, ChannelType, Partials } from 'discord.js'; 

// --- KLIENT I INTENTY ---

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent],
    // POPRAWKA: Użycie Partials.Channel
    partials: [Partials.Channel] 
});

client.once('clientReady', async (c) => {
    console.log(`Zalogowany jako ${c.user.tag}!`);

    const channelId = 'ID-KANAŁU-TU';
    const channel = client.channels.cache.get(channelId);

    if (channel) {
        channel.send('Update działa, kurwa.');
    } else {
        console.log('Nie znalazłem kanału, pajacu.');
    }
});


// ------------------- KOMENDY -------------------
const commands = [
    new SlashCommandBuilder().setName('co').setDescription('Odpowiada gówno i pokazuje latency').setDMPermission(true),
    new SlashCommandBuilder().setName('morda').setDescription('Wyzywa wskazaną osobę').addUserOption(o => o.setName('kto').setDescription('Kogo zwyzywać').setRequired(false)).setDMPermission(true), 
    new SlashCommandBuilder().setName('zabierz').setDescription('Zabiera coś komuś').addUserOption(o => o.setName('kto').setDescription('Komu zabrać').setRequired(false)).setDMPermission(true),
    new SlashCommandBuilder().setName('zajeb').setDescription('Daje mocne jebnięcie komuś').addUserOption(o => o.setName('kto').setDescription('Komu').setRequired(false)).setDMPermission(true),
    new SlashCommandBuilder().setName('wkurw').setDescription('Wkurwia kogoś').addUserOption(o => o.setName('kto').setDescription('Kogo').setRequired(false)).setDMPermission(true),
    new SlashCommandBuilder().setName('los').setDescription('Losuje losowo cokolwiek wkurwiającego').addUserOption(o => o.setName('kto').setDescription('Dla kogo losować').setRequired(false)).setDMPermission(true),
    new SlashCommandBuilder().setName('lisc').setDescription('Wysyła losowego liścia').addUserOption(o => o.setName('kto').setDescription('Komu dać liścia').setRequired(false)).setDMPermission(true),
    new SlashCommandBuilder().setName('love').setDescription('Losowy komplement miłosny').addUserOption(o => o.setName('kto').setDescription('Komu dać komplement').setRequired(false)).setDMPermission(true),
    new SlashCommandBuilder().setName('rozkurw').setDescription('Rozkurwia sytuację').setDMPermission(true),
    new SlashCommandBuilder().setName('impreza').setDescription('Opisuje imprezę').setDMPermission(true),
    new SlashCommandBuilder().setName('torcik').setDescription('Daje torcik komuś').addUserOption(o => o.setName('kto').setDescription('Komu dać torcik').setRequired(false)).setDMPermission(true),
    new SlashCommandBuilder().setName('wyruchaj').setDescription('Losowo wyrycha kogoś').addUserOption(o => o.setName('kto').setDescription('Kogo wyrychać').setRequired(false)).setDMPermission(true),
    new SlashCommandBuilder().setName('PORNO').setDescription('Wysyła losowe PORNO').setDMPermission(true)
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
    if (name === 'PORNO') {
        const teksty = [
            `${user}, Oto twoje losowe PORNO: https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
            `${user}Ty jakiś zjebany jesteś?`,
            `${user}Szukaj sam, nie jestem twoją kurwą!`,
            `${user}Nie dostaniesz PORNO ode mnie!`,
            `${user}Idź do diabła z tym PORNO!`,
            `${user}Nie mam zamiaru ci dawać PORNO!`,
            `${user}Szukaj gdzie indziej, nie tutaj!`,
            `${user}Nie jestem twoim dostawcą PORNO!`,
            `${user}Nie licz na mnie w sprawie PORNO!`,
            `${user}Idź się leczyć z tym PORNO!`,
            `Nie dostaniesz PORNO ode mnie, ${user}!`,
            `${user}, wykupił subskrypcję na PORNO!`,
            `${user}, szukał PORNO w Google!`,
            `${user}, próbował znaleźć PORNO na TikToku!`,
            `${user}, szukał PORNO na Instagramie!`,
            `${user}, próbował znaleźć PORNO na Facebooku!`,
            `${user}, szukał PORNO na Twitterze!`,
            `${user}, próbował znaleźć PORNO na Reddit!`
        ];
        return i.reply(randomFrom(teksty));
    }
if (name === 'wyruchaj') {
        const teksty = [
            `${user}Losowo wyruchał ${targetUser}!`,
            `${user}Znalazł okazję, by wyruchać ${targetUser}!`,
            `${user}Postanowił wyruchać ${targetUser} bez powodu!`,
            `${user}Nie mógł się powstrzymać i wyruchał ${targetUser}!`,
            `${user}Zaskoczył wszystkich, ruchając ${targetUser}!`,
            `${user}Wykorzystał moment i wyruchał ${targetUser}!`,
            `${user}Spontanicznie wyruchał ${targetUser}!`,
            `${user}Zdecydował się na wyruchanie ${targetUser}!`,
            `${user}Nieoczekiwanie wyruchał ${targetUser}!`,
            `${user}Zaskoczył wszystkich, wyruchując ${targetUser}!`,
            `${user}Wyruchał ${targetUser} w najbardziej nieoczekiwany sposób!`,
            `${user}Losowo wyruchał ${targetUser} w tajemnicy!`,
            `${user}Znalazł idealny moment, by wyruchać ${targetUser} w ukryciu!`,
            `${user}Postanowił wyruchać ${targetUser} w niecodzienny sposób!`,
            `${user}Znalazł idealny moment, by wyruchać ${targetUser}!`,
            `${user}Nie mógł się oprzeć i wyruchał ${targetUser}!`,
            `${user}Zaskoczył wszystkich, wyruchując ${targetUser} w tajemnicy!`,
            `${user}Spontanicznie wyruchał ${targetUser} na oczach wszystkich!`,
            `${user}Zdecydował się na wyruchanie ${targetUser} w nietypowy sposób!`,
            `${user}Nieoczekiwanie wyruchał ${targetUser} w środku nocy!`,
            `${user}Zaskoczył wszystkich, wyruchując ${targetUser} w najbardziej nieoczekiwanym momencie!`
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
            `${user}Zabrał godność ${targetUser}`,
            `${user}Zabrał honor ${targetUser}`,
            `${user}Zabrał ostatni pierdolony cukierek od ${targetUser}`,
            `${user}Zabrał szacunek od ${targetUser}`,
            `${user}Zabrał marzenia od ${targetUser}`,
            `${user}Zabrał nadzieję od ${targetUser}`,
            `${user}Zabrał radość od ${targetUser}`,
            `${user}Zabrał władzę od ${targetUser}`,
            `${user}Zabrał energię życiową od ${targetUser}`,
            `${user}Zabrał uśmiech od ${targetUser}`,
            `${user}Zabrał humor od ${targetUser}`,
            `${user}Zabrał złudzenia od ${targetUser}`,
            `${user}Zabrał talent od ${targetUser}`,
            `${user}Zabrał kreatywność od ${targetUser}`,
            `${user}Zabrał portfel od ${targetUser}`,
            `${user}Zabrał telefon od ${targetUser}`,
            `${user}Zabrał zegarek od ${targetUser}`,
            `${user}Zabrał klucze od ${targetUser}`,
            `${user}Zabrał jedzenie od ${targetUser}`,
            `${user}Zabrał tlen od ${targetUser}`
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
            `${user}, Los cię jebnie w dupę dzisiaj!`,
            `${user}, Dzisiaj los cię wkurwi`,
            `${user}, Nie wiadomo jak, ale coś spierdolisz`,
            `${user}, Wkurwiasz wszystkich wokół 😎`,
            `${user}, Dzisiaj pech cię znajdzie`,
            `${user}, Los cię wyśle na wkurw`,
            `${user}, Nie wiadomo co się stanie, ale jebanie pewne`,
            `${user}, Dzisiaj wszystko spierdolisz`,
            `${user}, Los cię kopie w dupę`,
            `${user}, Nie licz na szczęście, gnoju`,
            `${user}, Los wkurwia dzisiaj mocno`,
            `${user}, Kurde, los dzisiaj jebie`,
            `${user}, Nie ma nadziei, los wkurwia`,
            `${user}, Dzisiaj jesteś ofiarą losu`,
            `${user}, Los wybrał ciebie`,
            `${user}, Pech cię znajdzie`,
            `${user}, Los jest brutalny`,
            `${user}, Dzisiaj jebanie pewne`,
            `${user}, Nie licz na nic, gnoju`,
            `${user}, Los działa bez litości`
        ];
        return i.reply(randomFrom(teksty));
    }

    if (name === 'lisc') {
        const teksty = [
            `${targetUser}, dostałeś liścia od ${user}!`,
            `${targetUser}, liść wpadł w twarz od ${user}!`,
            `liść trafił ${targetUser}`,
            `${targetUser}, oberwałeś takim liściem że aż echo poszło od ${user}!`,
            `${targetUser}, ten liść był tak szybki że aż czas się zatrzymał od ${user}!`,
            `${targetUser}, ten liść był jak pocisk z kosmosu od ${user}!`,
            `${targetUser}, liść oberwał ciebie od ${user}!`,
            `${targetUser}, liscieć uderzył cię z prędkością światła od ${user}!`,
            `${targetUser}, to był liść z innej planety od ${user}!`,
            `${targetUser}, liść uderzył cię z taką siłą że aż ziemia zadrżała od ${user}!`,
            `${targetUser}, liść jak od samego boga od ${user}!`,
            `${targetUser}, wykurwisty liść trafił cię prosto w twarz od ${user}!`,
            `${targetUser}, liść spadł na ciebie jak grom z jasnego nieba od ${user}!`,
            `${targetUser}, lisciasty liść uderzył cię z taką mocą że aż gwiazdy zgasły od ${user}!`,
            `${targetUser}, lisciasty liść trafił cię z taką siłą że aż powietrze zawirowało od ${user}!`,
            `${targetUser}, dostal taki wpierdol ze krecik mu sie kręci od ${user}!`,
            `${targetUser}, ten lisc byl tak mocny ze twoj numer buta zna cale miasto od ${user}!`,
            `${targetUser}, od tego liscia nos ci krwawi od ${user}!`,
            `${targetUser}, od tego liścia nie uciekniesz od ${user}!`,
            `${targetUser}, dostal taki wpierdol ze myślisz że to huragan od ${user}!`,
            `${targetUser}, dostal eś liścia jak burza od ${user}!`,
            `${targetUser}, dostales tak mocno że myślisz że to tornado od ${user}!`
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