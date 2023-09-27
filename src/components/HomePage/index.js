import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function HomePage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

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

    return (
        <div>
            <h1>Home Page</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" value={input} onChange={e => setInput(e.target.value)} />
                <button type="submit">Send</button>
            </form>
            <div>
                {messages.map((msg, i) => (
                    <div key={i}>{msg.content}</div>
                ))}
            </div>
        </div>
    );
}