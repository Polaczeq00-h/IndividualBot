require('dotenv').config(); // jeśli lokalnie chcesz użyć .env
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const nacl = require('tweetnacl');

const app = express();
app.use(bodyParser.json());

const PUBLIC_KEY = process.env.PUBLIC_KEY;

// --- Discord Client (bot online) ---
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.login(process.env.DISCORD_TOKEN);

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// --- Slash command registration (guild only) ---
const commands = [
    {
        name: 'hello',
        description: 'Says hello!'
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

// --- Express endpoint dla raw interactions (opcjonalnie) ---
function verifyDiscordRequest(req) {
    const signature = req.headers['x-signature-ed25519'];
    const timestamp = req.headers['x-signature-timestamp'];
    const body = JSON.stringify(req.body);
    return nacl.sign.detached.verify(
        Buffer.from(timestamp + body),
        Buffer.from(signature, 'hex'),
        Buffer.from(PUBLIC_KEY, 'hex')
    );
}

app.post('/interactions', (req, res) => {
    if (!verifyDiscordRequest(req)) return res.status(401).send('Bad request signature');

    const interaction = req.body;

    if (interaction.type === 1) return res.json({ type: 1 }); // PING

    if (interaction.type === 2) {
        if (interaction.data.name === 'hello') {
            return res.json({
                type: 4,
                data: { content: 'Hello from IndividualBot!' }
            });
        }
    }

    res.status(400).send('Unknown interaction type');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`IndividualBot listening on port ${PORT}`));
