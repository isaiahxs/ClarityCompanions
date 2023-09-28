import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import OpenAI from 'openai';
import axios from 'axios';

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

// app.post('/api/completion', async (req, res) => {
//     const messages = req.body.messages;

//     console.log("THESE ARE OUR MESSAGES:", messages);  // Debugging line

//     if (!messages || !Array.isArray(messages) || messages.length === 0) {
//         res.status(400).json({ error: "'messages' is a required property and should be a non-empty array" });
//         return;
//     }

//     try {
//         const completion = await openai.chat.completions.create({
//             model: "gpt-3.5-turbo",
//             messages: messages,
//             max_tokens: 60
//         });

//         console.log("THIS IS THE OPENAI RESPONSE:", JSON.stringify(completion, null, 2));

//         // res.json(completion.choices[0]);
//         const assistantMessageContent = completion.choices[0].message.content;
//         res.json({ text: assistantMessageContent });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Something went wrong' });
//     }
// });


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

        const assistantMessageContent = completion.choices[0].message.content;
        console.log('THIS IS OUR assistantMessageContent:', assistantMessageContent);

        // Call ElevenLabs API
        const headers = {
            'xi-api-key': process.env.ELEVEN_API_KEY,
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json'
        };

        const data = {
            text: assistantMessageContent,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
                stability: 0.65,
                similarity_boost: 0.85,
                style: 0.10,
                use_speaker_boost: true
            }
        };

        console.log('THIS IS RIGHT BEFORE OUR ELEVEN RESPONSE');

        const elevenResponse = await axios.post(
            'https://api.elevenlabs.io/v1/text-to-speech/QXfxCfBzNjKSfjG6OB75/stream',
            data,
            { headers }
        )
        console.log('THIS IS OUR elevenResponse:', elevenResponse);
        console.log('THIS IS OUR ELEVEN DATA', elevenResponse.data)

        // Respond to frontend
        const base64AudioData = Buffer.from(elevenResponse.data).toString('base64');

        res.json({
            text: assistantMessageContent,
            audioData: base64AudioData
        });

        // res.json({ text: assistantMessageContent, audioData: elevenResponse.data });
        console.log('THIS IS OUR elevenResponse.data:', elevenResponse.data)

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// experimenting on basic eleven post request
app.post('/api/text-to-speech', async (req, res) => {
    const textData = req.body.textData;
    const headers = {
        'xi-api-key': process.env.ELEVEN_API_KEY,
        'Content-Type': 'application/json'
    };

    const data = {
        text: textData,
        // model_id: "eleven_monolingual_v1",
        model_id: "eleven_multilingual_v2",
        voice_settings: {
            stability: 0,
            similarity_boost: 0,
            style: 0,
            use_speaker_boost: true
        }
    };

    try {
        const response = await axios.post(
            'https://api.elevenlabs.io/v1/text-to-speech/QXfxCfBzNjKSfjG6OB75/stream',
            data,
            { headers }
        );
        console.log(response);
        // You'll likely want to do something with the response here, like sending the audio back to the client
        res.status(200).json(response.data);
    } catch (error) {
        console.error(JSON.stringify(error, null, 2));
        res.status(500).json({ error: 'Something went wrong' });
    }
});


// app.post('/api/text-to-speech', async (req, res) => {
//     const textData = req.body.textData;
//     const headers = {
//         'xi-api-key': process.env.ELEVEN_API_KEY,
//         'Content-Type': 'application/json'
//     };

//     const data = {
//         text: textData,
//         // model_id: "eleven_monolingual_v1",
//         model_id: "eleven_multilingual_v2",
//         voice_settings: {
//             stability: 0,
//             similarity_boost: 0,
//             style: 0,
//             use_speaker_boost: true
//         }
//     };

//     try {
//         const response = await axios.post(
//             'https://api.elevenlabs.io/v1/text-to-speech/QXfxCfBzNjKSfjG6OB75/stream',
//             data,
//             { headers }
//         );
//         console.log(response);
//         // You'll likely want to do something with the response here, like sending the audio back to the client
//         res.status(200).json(response.data);
//     } catch (error) {
//         console.error(JSON.stringify(error, null, 2));
//         res.status(500).json({ error: 'Something went wrong' });
//     }
// });

// pseudocode breakdown of what is happening
// import required libraries and modules

// 1. Import required libraries and modules
//    - dotenv for environment variables
//    - cors for cross-origin support
//    - express for server functionality
//    - OpenAI for the GPT-3 API

// 2. Initialize dotenv
//    - This allows you to use environment variables stored in a .env file

// 3. Initialize the Express app and set the port
//    - Here we create an instance of an Express application and specify the port on which it will run

// 4. Apply Middleware
//    - Use CORS to handle cross-origin requests
//    - Use express.json() to parse incoming JSON payloads

// 5. Set up a test GET endpoint
//    - A simple GET request to the root URL will respond with "Hello World!"

// 6. Start the server
//    - The Express app starts listening on the given port

// 7. Initialize the OpenAI API
//    - Using the API key stored in environment variables, initialize an OpenAI instance

// 8. Commented-out test function for OpenAI
//    - This is a test function to see how to interact with the OpenAI API (it's commented out, so not being used)

// 9. Define POST endpoint '/api/completion'
//    9.1 Extract 'messages' from the request body
//        - This should be an array of message objects

//    9.2 Validate 'messages'
//        - If 'messages' is missing or invalid, respond with a 400 error

//    9.3 Make API request to OpenAI
//        - Send 'messages' to OpenAI and await a response

//    9.4 Extract assistant message and send it to frontend
//        - Parse the OpenAI response to get the assistant's message and send it back in the API response

//    9.5 Handle Errors
//        - If anything goes wrong, catch the error and respond with a 500 error
