import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { messageService } from '../../utils/messageService';
import { useAuth } from '../../context/AuthContext';
import './MessageList.css';

const MessageList = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const data = await messageService.getConversations();
            setConversations(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching conversations:', err);
            setError('Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        if (isToday) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (now.getFullYear() === date.getFullYear()) {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    const getInitialAvatar = (name) => {
        return name.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button 
                    onClick={fetchConversations}
                    className="try-again-button"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon-container">
                    <svg xmlns="http://www.w3.org/2000/svg" className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </div>
                <h3 className="empty-title">No Messages Yet</h3>
                <p className="empty-description">
                    Your message inbox is empty. Start a conversation with a freelancer or client.
                </p>
                <Link to="/projects" className="browse-button">
                    Browse Projects
                </Link>
            </div>
        );
    }

    return (
        <div className="message-list-container">
            <div className="message-list-header">
                <h2 className="message-list-title">Messages</h2>
                <div className="message-count">
                    {conversations.length} {conversations.length === 1 ? 'Conversation' : 'Conversations'}
                </div>
            </div>
            
            <ul className="conversations-list">
                {conversations.map((conversation) => (
                    <li key={conversation.userId}>
                        <Link 
                            to={`/messages/${conversation.userId}`} 
                            className="conversation-link"
                        >
                            <div className="conversation-content">
                                <div className="avatar-container">
                                    <div className="avatar">
                                        {getInitialAvatar(conversation.userName)}
                                    </div>
                                    {conversation.unreadCount > 0 && (
                                        <span className="unread-badge">
                                            {conversation.unreadCount}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="conversation-details">
                                    <div className="conversation-header">
                                        <h3 className="contact-name">
                                            {conversation.userName}
                                        </h3>
                                        <span className="message-time">
                                            {formatDate(conversation.lastMessage.createdAt)}
                                        </span>
                                    </div>
                                    <p className={`message-preview ${conversation.unreadCount > 0 ? 'unread' : ''}`}>
                                        {conversation.lastMessage.senderId === user.id ? 
                                            <span className="sender-prefix">You:</span> : 
                                            ""
                                        }
                                        {conversation.lastMessage.content}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="chevron-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MessageList;