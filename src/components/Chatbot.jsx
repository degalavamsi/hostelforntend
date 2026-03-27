import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm **HostelPro Assistant**. How can I help you today? 🏠", isBot: true }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isLoading]);

    const handleSendMessage = async (msgText) => {
        const textToSend = msgText || input;
        if (!textToSend.trim()) return;

        const newMessages = [...messages, { text: textToSend, isBot: false }];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const response = await api.post('/chatbot/message', { message: textToSend });
            setMessages([...newMessages, { text: response.data.response, isBot: true }]);
        } catch (error) {
            console.error("Chatbot Error:", error);
            setMessages([...newMessages, { 
                text: "⚠️ **Connection Error**\n\nI'm having trouble reaching the server. Please ensure the backend is running and try again.", 
                isBot: true 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        { label: "🍱 Today's Menu", query: "what is today's menu" },
        { label: "📶 WiFi Info", query: "wifi password" },
        { label: "🎫 Raise Complaint", query: "how to raise a complaint" },
        { label: "🧺 Laundry Booking", query: "laundry booking steps" },
        { label: "📢 Announcements", query: "latest notices" },
        { label: "💰 Fee Status", query: "fee status" }
    ];

    // Helper to render markdown-like text (bold and newlines)
    const renderMessage = (text) => {
        return text.split('\n').map((line, i) => {
            // Simple bold replacement for **text**
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <div key={i} style={{ marginBottom: line.trim() === '' ? '10px' : '0' }}>
                    {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j}>{part.slice(2, -2)}</strong>;
                        }
                        // Handle `code` inline
                        const codeParts = part.split(/(`.*?`)/g);
                        return codeParts.map((cp, k) => {
                            if (cp.startsWith('`') && cp.endsWith('`')) {
                                return <code key={k} style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '4px' }}>{cp.slice(1, -1)}</code>;
                            }
                            return cp;
                        });
                    })}
                </div>
            );
        });
    };

    return (
        <div className="chatbot-container">
            {!isOpen && (
                <button className="chatbot-toggle" onClick={() => setIsOpen(true)} title="Chat with HostelPro Assistant">
                    <svg width="35" height="35" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525L2.06942 20.1992C1.94635 20.6725 2.32746 21.1275 2.81231 21.0535L6.68351 20.4621C7.99426 21.4326 9.61061 22 11.3636 22H12C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="white" fillOpacity="0.2"/>
                        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525L2.06942 20.1992C1.94635 20.6725 2.32746 21.1275 2.81231 21.0535L6.68351 20.4621C7.99426 21.4326 9.61061 22 11.3636 22H12C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="11" r="1.5" fill="white"/>
                        <circle cx="15" cy="11" r="1.5" fill="white"/>
                        <path d="M9 16C9 16 10 17 12 17C14 17 15 16 15 16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M12 6V4M8 5L7 3M16 5L17 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </button>
            )}

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div>
                            <h3>HostelPro Assistant</h3>
                            <small style={{ opacity: 0.8 }}>Online • Ready to help</small>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)} title="Close chat">×</button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
                                <div className="message-content">
                                    {renderMessage(msg.text)}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message bot">
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="quick-actions">
                        {quickActions.map((action, index) => (
                            <button key={index} onClick={() => handleSendMessage(action.query)}>
                                {action.label}
                            </button>
                        ))}
                    </div>

                    <div className="chatbot-input-container">
                        <div className="chatbot-input">
                            <input
                                type="text"
                                placeholder="Write a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button className="send-btn" onClick={() => handleSendMessage()} disabled={isLoading || !input.trim()}>
                                ✈️
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
