require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nacl = require('tweetnacl');

const app = express();
app.use(bodyParser.json());

const PUBLIC_KEY = process.env.PUBLIC_KEY;

// Funkcja weryfikująca podpis Discorda
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

    // Typ 1 = PING od Discorda
    if (interaction.type === 1) return res.json({ type: 1 });

    // Typ 2 = Slash command
    if (interaction.type === 2) {
        const commandName = interaction.data.name;

        if (commandName === 'hello') {
            return res.json({
                type: 4,
                data: { content: 'Hello from IndividualBot!' }
            });
        }
    }

    res.status(400).send('Unknown interaction type');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`IndividualBot listening on port ${PORT}`));
