// require('dotenv').config();
// import OpenAI from 'openai';
// const cors = require('cors');
// const axios = require('axios');

// const express = require('express');
// const app = express();
// const port = 3001;
// app.use(cors());
// app.use(express.json());


// app.get('/', (req, res) => {
//     res.send('Hello World!');
// });

// app.listen(port, () => {
//     console.log(`Server running on http://localhost:${port}`);
// });

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY
// });

// // const chatCompletion = await openai.chat.completions.create({
// //     model: "gpt-3.5-turbo",
// //     messages: [{ "role": "user", "content": "Hello!" }],
// // });
// // console.log(chatCompletion.choices[0].message);

// const testOpenAI = async () => {
//     const chatCompletion = await openai.chat.completions.create({
//         model: "gpt-3.5-turbo",
//         messages: [{ "role": "user", "content": "Hello!" }],
//     });
//     console.log(chatCompletion.choices[0].message);
// };

// testOpenAI();  // Call the async function to test OpenAI

// app.post('/api/completion', async (req, res) => {
//     const prompt = req.body.prompt; // Grab the user's prompt from the request body

//     const completion = await openai.createCompletion({
//         prompt: prompt,
//         max_tokens: 60
//     });

//     res.json(completion.data.choices[0]);
// });

// // app.post('/api/completion', async (req, res) => {

//     try {
//         const result = await axios.post(
//             'https://api.openai.com/v1/engines/davinci-codex/completions',
//             {
//                 prompt: 'Translate the following English text to French: {}',
//                 max_tokens: 60,
//             },
//             {
//                 headers: {
//                     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//                     'Content-Type': 'application/json',
//                 },
//             }
//         );

//         res.json(result.data);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

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

const testOpenAI = async () => {
    const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ "role": "user", "content": "Hello!" }],
    });
    console.log(chatCompletion.choices[0].message);
};

testOpenAI();  // Call the async function to test OpenAI

app.post('/api/completion', async (req, res) => {
    const prompt = req.body.prompt;

    const completion = await openai.chat.completions.create({
        prompt: prompt,
        max_tokens: 60
    });

    res.json(completion.data.choices[0]);
});