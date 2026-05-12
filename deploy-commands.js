import 'dotenv/config';
import { REST, Routes } from 'discord.js';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

console.log('Deploy-commands.js jest automatycznie uruchamiany z index.js');
console.log('Komendy są rejestrowane w index.js poprzez REST API.');
console.log('\nDokumentacja:');
console.log('- Wszystkie komendy są zdefiniowane w tablicy `commands` w index.js');
console.log('- Rejestracja następuje w sekcji "REJESTR KOMEND"');
console.log('- Dla lokalnego testowania użyj: node index.js');
