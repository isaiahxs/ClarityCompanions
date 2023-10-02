import React, { useState } from 'react';
import axios from 'axios';
import './SpeechToText.css'

const SpeechToText = ({ setTranscribedText }) => {
    const [recording, setRecording] = useState(false);
    const [audioData, setAudioData] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);

    const sendAudioToServer = async (audioBlob) => {
        const formData = new FormData();
        formData.append('file', audioBlob);

        try {
            const response = await axios.post('http://localhost:3001/api/transcribe', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.transcribedText) {
                setTranscribedText(response.data.transcribedText);
            }

            // Handle the response, e.g., update your state with the transcribed text
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

                let localAudioChunks = [];  // Using a local variable for immediate updates

                // const audioChunks = [];

                newMediaRecorder.addEventListener("dataavailable", (event) => {

                    localAudioChunks.push(event.data);

                    // audioChunks.push(event.data);
                    setAudioChunks((prevAudioChunks) => [...prevAudioChunks, event.data]);

                });

                newMediaRecorder.addEventListener("stop", () => {
                    // const audioBlob = new Blob(audioChunks);
                    // const audioUrl = URL.createObjectURL(audioBlob);
                    // setAudioData(audioUrl);

                    const audioBlob = new Blob(localAudioChunks, { type: 'audio/webm' });
                    sendAudioToServer(audioBlob);
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

            // Convert the audioChunks to a blob and send it to the backend
            // this is if we want everything we've said
            // const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            // sendAudioToServer(audioBlob);
        }
    };

    return (
        <div>
            <div className='recording-container'>
                <div className='recording-buttons'>
                    {/* <button className='start-recording' onClick={startRecording}>Start Recording</button> */}
                    <button className='start-recording' onClick={startRecording}>
                        {recording ? "Recording..." : "Start Recording"}
                    </button>
                    <button className='stop-recording' onClick={stopRecording}>Stop Recording</button>
                </div>
            </div>
            {audioData && (
                <div className='media-player-container'>
                    <audio className='media-player' src={audioData} controls />
                    {/* <a className='download-text' href={audioData} download="recorded-audio.webm">
                        <button className='download-button'>
                            Download
                        </button>
                    </a> */}
                </div>
            )}
        </div>
    );
};

export default SpeechToText;