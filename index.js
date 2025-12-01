const express = require('express');
const app = express();
app.use(express.json());

app.post('/interactions', (req, res) => {
    console.log(req.body);
    res.json({ type: 4, data: { content: 'Hello from IndividualBot!' } });
});

app.listen(process.env.PORT || 3000, () => console.log('Bot listening'));
