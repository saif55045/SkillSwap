import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageService } from '../../utils/messageService';
import './ConversationList.css';

const ConversationList = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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
            setError('Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="conversation-list-loading">Loading conversations...</div>;
    }
    if (error) {
        return <div className="conversation-list-error">{error}</div>;
    }
    if (conversations.length === 0) {
        return <div className="conversation-list-empty">No conversations yet.</div>;
    }

    return (
        <div className="conversation-list">
            <h2 className="conversation-list-title">Messages</h2>
            <ul className="conversation-list-ul">
                {conversations.map((conv) => (
                    <li
                        key={conv.userId}
                        className="conversation-item"
                        onClick={() => navigate(`/messages/${conv.userId}`)}
                    >
                        <div className="conversation-item-main">
                            <span className="conversation-item-username">{conv.userName}</span>
                            <span className="conversation-item-message">{conv.lastMessage?.content || 'No messages yet.'}</span>
                        </div>
                        <div className="conversation-item-meta">
                            <span className="conversation-item-date">
                                {conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleDateString() : ''}
                            </span>
                            {conv.unreadCount > 0 && (
                                <span className="conversation-item-unread">{conv.unreadCount}</span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConversationList; 