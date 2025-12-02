import 'dotenv/config';
import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } from 'discord.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent],
  partials: ['CHANNEL']
});

// ------------------- KOMENDY -------------------

const commands = [
  new SlashCommandBuilder().setName('co').setDescription('Odpowiada gówno i pokazuje latency'),
  new SlashCommandBuilder().setName('morda').setDescription('Wyzywa wskazaną osobę').addUserOption(o => o.setName('kto').setDescription('Kogo zwyzywać').setRequired(true)),
  new SlashCommandBuilder().setName('zabierz').setDescription('Zabiera coś komuś').addUserOption(o => o.setName('kto').setDescription('Komu zabrać').setRequired(true)),
  new SlashCommandBuilder().setName('zajeb').setDescription('Daje mocne jebnięcie komuś').addUserOption(o => o.setName('kto').setDescription('Komu').setRequired(true)),
  new SlashCommandBuilder().setName('wkurw').setDescription('Wkurwia kogoś').addUserOption(o => o.setName('kto').setDescription('Kogo').setRequired(true)),
  new SlashCommandBuilder().setName('jebanie').setDescription('Opisuje jebnięcie').addUserOption(o => o.setName('kto').setDescription('Kogo').setRequired(true)),
  new SlashCommandBuilder().setName('los').setDescription('Losuje losowo cokolwiek wkurwiającego').addUserOption(o => o.setName('kto').setDescription('Dla kogo losować').setRequired(false)),
  new SlashCommandBuilder().setName('lisc').setDescription('Wysyła losowego liścia').addUserOption(o => o.setName('kto').setDescription('Komu dać liścia').setRequired(true)),
  new SlashCommandBuilder().setName('love').setDescription('Losowy komplement miłosny').addUserOption(o => o.setName('kto').setDescription('Komu dać komplement').setRequired(true)),
  new SlashCommandBuilder().setName('rozkurw').setDescription('Rozkurwia sytuację'),
  new SlashCommandBuilder().setName('impreza').setDescription('Opisuje imprezę'),
  new SlashCommandBuilder().setName('torcik').setDescription('Daje torcik komuś').addUserOption(o => o.setName('kto').setDescription('Komu dać torcik').setRequired(true)),
].map(c => c.toJSON());

// ------------------- LOGIKA -------------------

client.on('interactionCreate', async i => {
  if (!i.isChatInputCommand()) return;
  const name = i.commandName;
  const user = i.options?.getUser('kto');

  const randomFrom = arr => arr[Math.floor(Math.random() * arr.length)];
  const latency = Date.now() - i.createdTimestamp;

  if (name === 'co') {
    return i.reply(`Gówno \nLatency: ${latency}ms`);
  }

  if (name === 'morda') {
    const teksty = [
      `${user} wygląda jak patch notesy po pijaku`,
      `${user}, twoja twarz to błąd 404`,
      `${user} ma aurę Windowsa XP po formacie`,
      `${user} wygląda jakby wstał w złym DLC`,
      `${user} śmierdzi jak spalony kabel`,
      `${user} jest jak bug, którego nikt nie zgłosi`,
      `${user} ma vibe beta-testera życia`,
      `${user} wygląda jakby jadł tylko fast food`,
      `${user} jest bardziej toksyczny niż mój router`,
      `${user} wygląda jakby spał w serwerowni`,
      `${user} ma twarz jak 404 not found`,
      `${user} świeci jak monitor CRT`,
      `${user} ma styl jak nieudany update`,
      `${user} wygląda jakby grał w życie na easy`,
      `${user} jest bardziej zgniły niż banana w koszu`,
      `${user} ma aura Windowsa 98`,
      `${user} wygląda jak patch po patchu`,
      `${user} jest jak bug bez stacktrace`,
      `${user} świeci jak LED, ale popsuty`,
      `${user} wygląda jakby nie zaktualizował życia od 2010`
    ];
    return i.reply(randomFrom(teksty));
  }

  if (name === 'zabierz') {
    const teksty = [
      `Zabrałem godność ${user}`,
      `Zabrałem honor ${user}`,
      `Zabrałem ostatni pierdolony cukierek od ${user}`,
      `Zabrałem szacunek od ${user}`,
      `Zabrałem marzenia od ${user}`,
      `Zabrałem nadzieję od ${user}`,
      `Zabrałem radość od ${user}`,
      `Zabrałem władzę od ${user}`,
      `Zabrałem energię życiową od ${user}`,
      `Zabrałem uśmiech od ${user}`,
      `Zabrałem humor od ${user}`,
      `Zabrałem złudzenia od ${user}`,
      `Zabrałem talent od ${user}`,
      `Zabrałem kreatywność od ${user}`,
      `Zabrałem portfel od ${user}`,
      `Zabrałem telefon od ${user}`,
      `Zabrałem zegarek od ${user}`,
      `Zabrałem klucze od ${user}`,
      `Zabrałem jedzenie od ${user}`,
      `Zabrałem tlen od ${user}`
    ];
    return i.reply(randomFrom(teksty));
  }

  if (name === 'zajeb') {
    const teksty = [
      `${user} dostał solidny wpierdol`,
      `${user} oberwał jak kurwa`,
      `${user} wylądował na ziemi`,
      `${user} dostał po ryju`,
      `${user} oberwał mocniej niż kabel w ścianie`,
      `${user} dostał jak bug w patchu`,
      `${user} oberwał jak serwer w crashu`,
      `${user} dostał wpierdol epicki`,
      `${user} oberwał jak CPU po OC`,
      `${user} dostał po dupie`,
      `${user} oberwał w twarz`,
      `${user} oberwał jak laptop bez baterii`,
      `${user} dostał w głowę`,
      `${user} oberwał w klatę`,
      `${user} oberwał jak update systemu`,
      `${user} dostał w nogi`,
      `${user} oberwał jak troll w internecie`,
      `${user} oberwał mocniej niż kabel USB`,
      `${user} oberwał jak bug w kodzie`,
      `${user} oberwał jak serwerownia w nocy`
    ];
    return i.reply(randomFrom(teksty));
  }

  if (name === 'wkurw') {
    const teksty = [
      `${user} jest wkurwiony jak piekarnik`,
      `${user} dostał wkurw`,
      `${user} wkurwił wszystkich wokół`,
      `${user} wkurw jak CPU po OC`,
      `${user} jest wkurwiony jak bug w patchu`,
      `${user} wkurwił się mocniej niż kabel w ścianie`,
      `${user} dostał wkurw epicki`,
      `${user} wkurwił jak serwer w crashu`,
      `${user} wkurwił się jak monitor CRT`,
      `${user} jest wkurwiony jak router`,
      `${user} dostał wkurw jak patch notes`,
      `${user} wkurwił się jak laptop bez baterii`,
      `${user} dostał wkurw w głowę`,
      `${user} wkurwił się w klatę`,
      `${user} wkurwił jak troll w internecie`,
      `${user} wkurwił się jak bug w kodzie`,
      `${user} wkurwił się mocniej niż USB`,
      `${user} wkurwił jak update systemu`,
      `${user} dostał wkurw w nogi`,
      `${user} wkurwił wszystkich w okolicy`
    ];
    return i.reply(randomFrom(teksty));
  }

  if (name === 'jebanie') {
    const teksty = [
      `${user} wyruchał wszystko na swojej drodze`,
      `${user} jebie jak szalony`,
      `${user} ma jebanie na maxa`,
      `${user} jebie jak bug w kodzie`,
      `${user} jebie jak patch notes`,
      `${user} jebie jak serwer w crashu`,
      `${user} jebie jak laptop bez baterii`,
      `${user} jebie jak update systemu`,
      `${user} jebie jak troll w internecie`,
      `${user} jebie jak kabel USB po przepięciu`,
      `${user} jebie jak CPU po OC`,
      `${user} jebie jak monitor CRT`,
      `${user} jebie jak router po restarcie`,
      `${user} jebie jak szalony!!!`,
      `${user} jebie jak nigdy wcześniej`,
      `${user} jebie jakby jutra miało nie być`,

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
      `${user}, dostałeś liścia!`,
      `${user}, liść wpadł w twarz`,
      `${user}, liść przykrył twoją głowę`,
      `${user}, liść frunie w powietrzu`,
      `liść trafił ${user}`,
      `${user}, oberwałeś takim liściem że aż echo poszło`,
      `${user}, ten liść był tak szybki że aż czas się zatrzymał`,
      `${user}, ten liść był jak pocisk z kosmosu`,
      `${user}, liść oberwał ciebie`,
      `${user}, liscieć uderzył cię z prędkością światła`,
      `${user}, to był liść z innej planety`,
      `${user}, liść uderzył cię z taką siłą że aż ziemia zadrżała`,
      `${user}, liść jak od samego boga`,
      `${user}, wykurwisty liść trafił cię prosto w twarz`,
      `${user}, liść spadł na ciebie jak grom z jasnego nieba`,
      `${user}, lisciasty liść uderzył cię z taką mocą że aż gwiazdy zgasły`,
      `${user}, lisciasty liść trafił cię z taką siłą że aż powietrze zawirowało`,
      `${user}, dostal taki wpierdol ze kreciki mu sie kreci`,
      `${user}, ten lisc byl tak mocny ze twoj numer buta zna cale miasto`,
      `${user}, od tego liscia nos ci krwawi`,
      `${user}, od tego liścia nie uciekniesz`,
      `${user}, dostal taki wpierdol ze myślisz że to huragan`,
      `${user}, dostal eś liścia jak burza`,
      `${user}, dostales tak mocno że myślisz że to tornado`
    ];
    return i.reply(randomFrom(teksty));
  }

  if (name === 'love') {
    const teksty = [
      `${user} jesteś moim słoneczkiem`,
      `${user} kocham cię jak bugi w kodzie`,
      `${user} jesteś epicki`,
      `${user} wyglądasz jak patch notes`,
      `${user} jesteś piękny jak stacktrace`,
      `${user} masz vibe tryhard`,
      `${user} świecisz jak monitor`,
      `${user} jesteś jak bug w systemie`,
      `${user} epickość w czystej formie`,
      `${user} piękno lvl hard`,
      `${user} kocham cię mocno`,
      `${user} jesteś boski`,
      `${user} masz urok jak update`,
      `${user} epicki człowiek`,
      `${user} jesteś jak laptop bez baterii`,
      `${user} kocham cię jak router`,
      `${user} epicki jak patch`,
      `${user} jesteś legendarny`,
      `${user} epickość bez granic`,
      `${user} piękno lvl expert`,
      `${user} jesteś moim życiem`,
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
      `Torcik dla ${user}`,
      `Daję torcik dla  ${user}`,
      `Podarowałem torcik dla  ${user}`,
      `Torcik trafił do ${user}`,
      `Torcik dla Ciebie, ${user}`,
      `Smaczny torcik dla  ${user}`,
      `Torcik wpadł do rąk ${user}`,
      `Torcik dla bohatera ${user}`,
      `Torcik specjalnie dla ${user}`,
      `Torcik z humorem dla ${user}`,
      `Torcik dla najlepszego ${user}`,
      `Torcik z miłością dla ${user}`,
      `Torcik dla epickiego ${user}`,
      `Torcik dla legendarnego ${user}`,
      `Torcik dla wkurwionego ${user}`,
      `Torcik dla słoneczka o imieniu: ${user}`,
      `Torcik dla tryhard dla ${user}`,
      `Torcik lvl hard dla ${user}`,
      `Torcik lvl expert dla ${user}`,
      `Torcik dla wszystkich!`
    ];
    return i.reply(randomFrom(teksty));
  }
});

// ------------------- LOGIN -------------------

if (!process.env.DISCORD_TOKEN) throw new Error('Brakuje DISCORD_TOKEN w .env');

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function registerCommands() {
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('Zarejestrowano komendy.');
  } catch (err) {
    console.error('Błąd przy rejestracji komend:', err);
  }
}

registerCommands();

client.login(process.env.DISCORD_TOKEN).then(() => console.log('Bot zalogowany!'))
.catch(err => console.error('Token jest jebnięty', err));
