import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './HomePage.css';

export default function HomePage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

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

    useEffect(() => {
        const messagesContainer = document.querySelector('.messages-container');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, [messages]);  // Run this effect whenever 'messages' changes

    return (

        <div className='home-container'>
            <h1>How can we help you today?</h1>
            {/* need to make it distinguishable who the message is coming from. if it is me or the assistant */}
            <div className='messages-container'>
                {messages.map((msg, i) => (
                    <>
                        <p className='message' key={i}>{msg.content}</p>
                        <div className='divider-line' />
                    </>
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
        </div>
    );
}