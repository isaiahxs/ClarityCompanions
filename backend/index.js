import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Initialize OpenAI instance
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// const testOpenAI = async () => {
//     const chatCompletion = await openai.chat.completions.create({
//         model: "gpt-3.5-turbo",
//         messages: [{ "role": "user", "content": "Hello!" }],
//     });
//     console.log(chatCompletion.choices[0].message);
// };

// testOpenAI();  // Call the async function to test OpenAI

app.post('/api/completion', async (req, res) => {
    const messages = req.body.messages;

    console.log("THESE ARE OUR MESSAGES:", messages);  // Debugging line

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: "'messages' is a required property and should be a non-empty array" });
        return;
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 60
        });

        console.log("THIS IS THE OPENAI RESPONSE:", JSON.stringify(completion, null, 2));

        // res.json(completion.choices[0]);
        const assistantMessageContent = completion.choices[0].message.content;
        res.json({ text: assistantMessageContent });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});