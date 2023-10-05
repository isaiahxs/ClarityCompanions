import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import OpenAI from 'openai';
import axios from 'axios';
import FormData from 'form-data';
import multer from 'multer';
import fs from 'fs';

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

// Middleware for handling 'multipart/form-data'. Allows a single file to be uploaded with field name 'file' that would temporarily be stored in 'uploads' folder
const upload = multer({ dest: 'uploads/' });

app.post('/api/test', upload.single('file'), (req, res) => {
    res.send('Check the console');
});

// Define an async POST endpoint
app.post('/api/transcribe', upload.single('file'), async (req, res) => {
    // Use 'upload.single('file')' middleware to handle single file upload

    // Begin try-catch for error handling
    try {
        if (!req.file || req.file.size === 0) {
            console.error("No audio file provided or file is empty.");
            return res.status(400).json({ error: 'No audio file provided' });
        }

        // Read the uploaded audio file into a buffer using 'fs.readFileSync()'
        const fileBuffer = fs.readFileSync(req.file.path);

        // Initialize a new FormData object
        const formData = new FormData();

        // Append the file buffer to the FormData object with the filename 'myfile.wav'
        formData.append('file', fileBuffer, { filename: 'myfile.wav' });

        // Append 'model' as 'whisper-1' to the FormData object for OpenAI API request
        formData.append('model', 'whisper-1');

        // Create headers object, adding FormData's headers and OpenAI API Authorization
        const headers = {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        };

        const openaiResponse = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, { headers });

        // Optional: Remove the temporary file
        // fs.unlink(req.file.path, (err) => {
        //     if (err) console.error("Couldn't delete file:", err);
        // });

        await new Promise((resolve, reject) => {
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error("Couldn't delete file:", err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        // Send the response containing the transcribed text from OpenAI API
        res.json({
            transcribedText: openaiResponse.data.text
        });

    } catch (error) {
        console.error("Error:", error);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.post('/api/completion', async (req, res) => {
    const messages = req.body.messages;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: "'messages' is a required property and should be a non-empty array" });
        return;
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 100
        });

        const assistantMessageContent = completion.choices[0].message.content;

        // Call ElevenLabs API
        const headers = {
            'xi-api-key': process.env.ELEVEN_API_KEY,
            'Accept': '*/*',
            'Content-Type': 'application/json'
        };

        // const data = {
        //     "text": assistantMessageContent,
        //     "model_id": "eleven_multilingual_v2",
        //     "voice_settings": {
        //         "stability": 0.65,
        //         "similarity_boost": 0.85,
        //         "style": 0.10,
        //         "use_speaker_boost": true
        //     }
        // }

        const data = {
            "text": assistantMessageContent,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.65,
                "similarity_boost": 1,
                "style": 0.15,
                "use_speaker_boost": true
            }
        }

        const isValidBase64 = (str) => {
            try {
                return btoa(atob(str)) === str;
            } catch (err) {
                return false;
            }
        };

        const elevenResponse = await axios.post(
            'https://api.elevenlabs.io/v1/text-to-speech/QXfxCfBzNjKSfjG6OB75/stream',
            data,
            {
                headers,
                responseType: 'arraybuffer'
            } //this tells Axios to treat the response data as binary data
        )

        // TO MAKE SURE WE ARE GETTING THE RIGHT DATA AND IT IS READABLE
        // fs.writeFileSync('directOutput.mp3', elevenResponse.data, 'binary');

        // Respond to frontend
        const base64AudioData = Buffer.from(elevenResponse.data, 'binary').toString('base64');

        // Check if base64AudioData is actually valid base64
        // if (isValidBase64(base64AudioData)) {
        //     console.log("This is a valid base64 string.");
        // } else {
        //     console.log("This is NOT a valid base64 string.");
        // }

        res.json({
            text: assistantMessageContent,
            audioData: base64AudioData
            // audioData: elevenResponse.data
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.all('*', (req, res) => {
    console.log(`Unmatched route: ${req.method} ${req.path}`);
});

// ====================================================================================================
//old completion route before implementing eleven labs

// app.post('/api/completion', async (req, res) => {
//     const messages = req.body.messages;

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

//         // res.json(completion.choices[0]);
//         const assistantMessageContent = completion.choices[0].message.content;
//         res.json({ text: assistantMessageContent });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Something went wrong' });
//     }
// });

// ====================================================================================================
//original route to test eleven labs api

// experimenting on basic eleven post request
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
//         // You'll likely want to do something with the response here, like sending the audio back to the client
//         res.status(200).json(response.data);
//     } catch (error) {
//         console.error(JSON.stringify(error, null, 2));
//         res.status(500).json({ error: 'Something went wrong' });
//     }
// });

// ====================================================================================================
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
