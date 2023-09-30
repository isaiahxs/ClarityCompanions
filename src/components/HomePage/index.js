import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Navigation from '../Navigation';
import Footer from '../Footer';

import starryMountains from '../../assets/videos/starry-mountains.mp4';
import backgroundMusic from '../../assets/music/OG-slowed.mp3';
// import backgroundMusic from '../../assets/music/OG-basic-piano.mp3';
// import backgroundMusic from '../../assets/music/OG-rous-cover.mp3';
import './HomePage.css';

export default function HomePage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [lastAudioURL, setLastAudioURL] = useState(null);  // New State

    const [isMusicPlaying, setIsMusicPlaying] = useState(false); // State to toggle music
    const [volume, setVolume] = useState(0.5); // Initial volume set to 50%

    const [isVoiceAssistantEnabled, setIsVoiceAssistantEnabled] = useState(false);
    const voiceAssistantAudioRef = useRef(null); // Ref to the voice assistant audio element
    const [voiceAssistantVolume, setVoiceAssistantVolume] = useState(0.5); // Initial volume set to 50%

    const toggleVoiceAssistant = () => {
        setIsVoiceAssistantEnabled(!isVoiceAssistantEnabled);
    };

    const audioRef = useRef(null); // Ref to the audio element
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.5; // Slow down by half
        }
    }, []);

    // Toggle function for background music
    const toggleMusic = () => {
        if (audioRef.current) {
            if (isMusicPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsMusicPlaying(!isMusicPlaying);
        }
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        if (voiceAssistantAudioRef.current) {
            voiceAssistantAudioRef.current.volume = voiceAssistantVolume;
        }
    }, [voiceAssistantVolume]);

    const handleVolumeChange = (e) => {
        setVolume(e.target.value);
    };

    const handleVoiceAssistantVolumeChange = (e) => {
        setVoiceAssistantVolume(e.target.value);
    };

    const handleInput = (e) => {
        const textarea = e.target;
        setInput(textarea.value);
        // Reset the height to "auto"
        textarea.style.height = "auto";
        // Set the height to scroll height + some padding (e.g., 4px)
        if (textarea.scrollHeight <= 200) {
            textarea.style.height = `${textarea.scrollHeight + 4}px`;
        } else {
            textarea.style.height = "200px";
        }
    };

    const isValidBase64 = (str) => {
        try {
            return btoa(atob(str)) === str;
        } catch (err) {
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Add user's message to chat log
        const userMessage = { role: 'user', content: input };
        const updatedMessages = [...messages, userMessage];

        // Update the state here
        setMessages(updatedMessages);

        // Send a request to your backend
        try {
            const response = await axios.post('http://localhost:3001/api/completion', { messages: updatedMessages });
            // console.log('THIS IS OUR RESPONSE:', response);
            // console.log('THIS IS OUR RESPONSE DATA:', response.data);
            // console.log('THIS IS THE TYPE OF RESPONSE DATA', typeof response.data.audioData);

            console.log('ORIGINAL BASE64:', response.data.audioData);

            if (isValidBase64(response.data.audioData)) {
                console.log("This is a valid base64 string.");
            } else {
                console.log("This is NOT a valid base64 string.");
            }


            // Check if 'text' exists in response.data, if not, look at 'content' which you use in OpenAI response
            const assistantMessageContent = response.data.text || response.data.content;

            const assistantMessage = { role: 'assistant', content: assistantMessageContent };
            console.log('THIS IS OUR assistantMessage:', assistantMessage);

            // Add assistant's message to chat log
            setMessages(prevMessages => [...prevMessages, assistantMessage]);

            if (isVoiceAssistantEnabled) {
                await new Promise(resolve => {


                    //---- converting base64 back to binary data (byte array), creating a blob from the byte array, creating an object url from the blob, setting the object url as the 'src' of the audio element and playing the audio
                    // Decode the base64 string into a byte array
                    const byteCharacters = atob(response.data.audioData);
                    console.log('THIS IS OUR DECODED STRING:', byteCharacters)

                    const byteNumbers = Array.from(byteCharacters, (char) => char.charCodeAt(0));
                    console.log('THESE ARE OUR BYTE NUMBERS:', byteNumbers);

                    const byteArray = new Uint8Array(byteNumbers);
                    console.log('THIS IS OUR BYTE ARRAY:', byteArray);

                    // Convert the byte array to a Blob
                    const audioBlob = new Blob([byteArray], { type: 'audio/mp3' });
                    console.log('THIS IS OUR audioBlob:', audioBlob);

                    // Create an object URL from the Blob
                    const audioURL = URL.createObjectURL(audioBlob);
                    console.log('THIS IS OUR audioURL:', audioURL)

                    setLastAudioURL(audioURL);  // New Line

                    // Code to download the blob as an MP3 file and see if it works
                    // const a = document.createElement("a");
                    // document.body.appendChild(a);
                    // a.style = "display: none";
                    // a.href = audioURL;
                    // a.download = 'test.mp3';
                    // a.click();

                    // not needed and was actually causing the audio to not play
                    // window.URL.revokeObjectURL(audioURL);

                    // Wait for the audio to load metadata before playing
                    voiceAssistantAudioRef.current.addEventListener("loadedmetadata", () => {
                        resolve();
                    });


                    voiceAssistantAudioRef.current.src = audioURL;
                });
                // Now play the audio
                voiceAssistantAudioRef.current.play().catch(e => console.error('playback failed', e));
                // voiceAssistantAudioRef.current.play();
            } else {
                console.error('audioData not found');
            }

            // Clear the input
            setInput('');
        } catch (error) {
            console.error("There was an error in communicating with the OpenAI API:", error);
            console.error('Error Response:', error.response);
            console.error('Error Request:', error.request);
        }
    };

    const replayAudio = () => {
        if (lastAudioURL) {
            voiceAssistantAudioRef.current.src = lastAudioURL;
            voiceAssistantAudioRef.current.play().catch(e => console.error('playback failed', e));
        } else {
            console.log("No audio to replay");
        }
    };

    return (
        <>
            <Navigation />
            <div>

                <audio ref={audioRef} loop>
                    <source src={backgroundMusic} type="audio/mp3" />
                </audio>
                <audio ref={voiceAssistantAudioRef}></audio>
                <video className='background-video' ref={videoRef} autoPlay loop muted>
                    <source src={starryMountains} type='video/mp4' />
                    Your browser does not support the video tag.
                </video>

                <div className='home-container'>
                    <h1>How can we help you?</h1>
                    {/* need to make it distinguishable who the message is coming from. if it is me or the assistant */}
                    <div className='messages-container'>
                        {messages.map((msg, i) => (
                            <div className='individual-message' key={i}>
                                <p className='message'>{msg.content}</p>
                                <div className='divider-line' />
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className='input-section'>
                            <textarea
                                className='input-field'
                                type="text"
                                value={input}
                                // onChange={e => setInput(e.target.value)}
                                onChange={handleInput}
                            />
                            <button className='send-button' type="submit">Send</button>
                        </div>
                    </form>
                    <button className='toggle-music-button' onClick={toggleMusic}>
                        {isMusicPlaying ? 'Pause Music' : 'Play Music'}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                    />

                    <button className='toggle-va-button' onClick={toggleVoiceAssistant}>
                        {isVoiceAssistantEnabled ? 'Disable Voice Assistant' : 'Enable Voice Assistant'}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={voiceAssistantVolume}
                        onChange={handleVoiceAssistantVolumeChange}
                    />
                    <button className='replay-audio-button' onClick={replayAudio}>
                        Play Again
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );
}