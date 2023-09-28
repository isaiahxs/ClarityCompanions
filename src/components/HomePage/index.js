import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import starryMountains from '../../assets/videos/starry-mountains.mp4';
import backgroundMusic from '../../assets/music/OG-slowed.mp3';
// import backgroundMusic from '../../assets/music/OG-basic-piano.mp3';
// import backgroundMusic from '../../assets/music/OG-rous-cover.mp3';
import './HomePage.css';

export default function HomePage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const [isMusicPlaying, setIsMusicPlaying] = useState(false); // State to toggle music
    const [volume, setVolume] = useState(0.5); // Initial volume set to 50%

    const audioRef = useRef(null); // Ref to the audio element

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

    const handleVolumeChange = (e) => {
        setVolume(e.target.value);
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

            // Check if 'text' exists in response.data, if not, look at 'content' which you use in OpenAI response
            const assistantMessageContent = response.data.text || response.data.content;

            const assistantMessage = { role: 'assistant', content: assistantMessageContent };

            // Add assistant's message to chat log
            setMessages(prevMessages => [...prevMessages, assistantMessage]);

            // Clear the input
            setInput('');
        } catch (error) {
            console.error("There was an error in communicating with the OpenAI API:", error);
        }
    };

    // useEffect(() => {
    //     const messagesContainer = document.querySelector('.messages-container');
    //     messagesContainer.scrollTop = messagesContainer.scrollHeight;
    // }, [messages]);  // Run this effect whenever 'messages' changes

    return (
        <>
            <audio ref={audioRef} loop>
                <source src={backgroundMusic} type="audio/mp3" />
            </audio>
            {/* <button onClick={toggleMusic}>
                {isMusicPlaying ? 'Pause Music' : 'Play Music'}
            </button> */}

            <video className='background-video' autoPlay loop muted>
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
            </div>
        </>
    );
}