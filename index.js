// index.js
import 'dotenv/config';
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: ['CHANNEL']
});

// --------------------------- KOMENDY ---------------------------

const globalCommands = [
  new SlashCommandBuilder().setName('kot').setDescription('Wysyła kota').setDMPermission(true),
  new SlashCommandBuilder().setName('pies').setDescription('Wysyła psa').setDMPermission(true),
  new SlashCommandBuilder().setName('meme').setDescription('Losowy mem z folderu ./memes/').setDMPermission(true)
].map(c => c.toJSON());

const serverCommands = [
  new SlashCommandBuilder().setName('morda').setDescription('Wyzywa wskazaną osobę')
    .addUserOption(o => o.setName('kto').setDescription('Kogo zwyzywać').setRequired(true))
].map(c => c.toJSON());

// --------------------------- REJESTRACJA ---------------------------

if (!process.env.DISCORD_TOKEN) throw new Error('Brakuje DISCORD_TOKEN w .env');

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function registerCommands() {
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: globalCommands });
    console.log('Zarejestrowano GLOBALNE komendy (DM).');
  } catch (err) {
    console.error('Błąd przy rejestracji komend:', err);
  }
}

registerCommands();

// --------------------------- LOGIKA ---------------------------

client.on('interactionCreate', async i => {
  if (!i.isChatInputCommand()) return;
  const name = i.commandName;

  // ---------- DM KOMENDY ----------
  if (i.channel.type === 1) { // DM
    if (name === 'kot') {
      const num = Math.floor(Math.random() * 100) + 1;
      return i.reply({ files: [`./cats/${num}.jpg`] });
    }
    if (name === 'pies') {
      try {
        const res = await fetch('https://random.dog/woof.json');
        const data = await res.json();
        if (data.url.endsWith('.mp4') || data.url.endsWith('.webm')) return i.reply('Losowy pies był filmem, spróbuj jeszcze raz.');
        return i.reply(data.url);
      } catch {
        return i.reply('Nie udało się pobrać pieska, kurwa.');
      }
    }
  }

  // ---------- GUILD KOMENDY ----------
  if (i.guild) {
    if (name === 'morda') {
      const user = i.options.getUser('kto');
      const teksty = [
        `${user} wygląda jak patch notesy po pijaku`,
        `${user}, twoja twarz to błąd 404`,
        `${user} ma aurę Windowsa XP po formacie`,
        `${user} wygląda jakby wstał w złym DLC`
      ];
      return i.reply(teksty[Math.floor(Math.random() * teksty.length)]);
    }
  }
});

// --------------------------- LOGIN ---------------------------

console.log('Próba logowania...');
client.login(process.env.DISCORD_TOKEN).then(() => {
  console.log('Zalogowano do Discorda!');
}).catch(err => {
  console.error('Token jest jebnięty, sprawdź DISCORD_TOKEN w .env', err);
});
