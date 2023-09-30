import React, { useState } from 'react';
import axios from 'axios';

const SpeechToText = () => {
    const [recording, setRecording] = useState(false);
    const [audioData, setAudioData] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);

    const sendAudioToServer = async (audioBlob) => {
        const formData = new FormData();
        formData.append('file', audioBlob);
        console.log('Audio Blob:', audioBlob)

        try {
            const response = await axios.post('http://localhost:3001/api/transcribe', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Handle the response, e.g., update your state with the transcribed text
            console.log(response.data.transcribedText);
        } catch (error) {
            console.error("Error sending audio data:", error);
        }
    };

    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const newMediaRecorder = new MediaRecorder(stream);
                setMediaRecorder(newMediaRecorder);
                newMediaRecorder.start();

                console.log("MediaRecorder mimeType:", newMediaRecorder.mimeType);

                const audioChunks = [];

                newMediaRecorder.addEventListener("dataavailable", (event) => {
                    // console.log("Data available:", event);
                    console.log("Data available, Size:", event.data.size);


                    // audioChunks.push(event.data);
                    setAudioChunks((prevAudioChunks) => [...prevAudioChunks, event.data]);

                });

                console.log("MediaRecorder State:", newMediaRecorder.state);

                newMediaRecorder.addEventListener("stop", () => {
                    console.log("Recording stopped.");
                    const audioBlob = new Blob(audioChunks);
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setAudioData(audioUrl);
                });

                setRecording(true);
            });
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setRecording(false);

            console.log("Audio Chunks:", audioChunks);

            // Convert the audioChunks to a blob and send it to the backend
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            sendAudioToServer(audioBlob);
        }
    };

    return (
        <div>
            <button onClick={startRecording}>Start Recording</button>
            <button onClick={stopRecording}>Stop Recording</button>
            {audioData && (
                <>
                    <audio src={audioData} controls />
                    <a href={audioData} download="recorded-audio.webm">Download</a>
                </>
            )}
        </div>
    );
};

export default SpeechToText;