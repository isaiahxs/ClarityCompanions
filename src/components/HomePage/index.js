import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function HomePage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Add user's message to chat log
        const userMessage = { role: 'user', content: input };
        setMessages([...messages, userMessage]);

        // Send a request to your backend
        const response = await axios.post('http://localhost:3001/api/completion', { prompt: input });
        const assistantMessage = { role: 'assistant', content: response.data.text };

        // Add assistant's message to chat log
        setMessages([...messages, userMessage, assistantMessage]);

        // Clear the input
        setInput('');
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