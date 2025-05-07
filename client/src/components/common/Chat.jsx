import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageService } from '../../utils/messageService';
import { socketService } from '../../utils/socketService';
import { useAuth } from '../../context/AuthContext';
import './Chat.css';

const Chat = () => {
    const { userId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    
    const messagesEndRef = useRef(null);
    const messageContainerRef = useRef(null);
    const unsubscribeRef = useRef(null);

    useEffect(() => {
        fetchConversation();
        
        const handleNewMessage = (data) => {
            if (data.senderId === userId) {
                setMessages(prev => [
                    ...prev,
                    {
                        _id: Date.now(),
                        content: data.message,
                        senderId: { _id: data.senderId },
                        receiverId: { _id: user.id },
                        createdAt: data.timestamp,
                        readStatus: false
                    }
                ]);
                markMessagesAsRead();
            }
        };
        
        socketService.joinChat(userId);
        unsubscribeRef.current = socketService.subscribeToMessages({
            onNewMessage: handleNewMessage
        });
        
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [userId, user.id]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const fetchConversation = async (newPage = 1) => {
        try {
            setLoading(true);
            const data = await messageService.getConversation(userId);
            setMessages(data.messages.reverse());
            setOtherUser(data.messages[0]?.senderId._id === userId 
                ? data.messages[0].senderId 
                : data.messages[0]?.receiverId);
            setHasMore(data.currentPage < data.totalPages);
            setPage(newPage);
            setError(null);
        } catch (err) {
            console.error('Error fetching conversation:', err);
            setError('Failed to load conversation');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim()) return;
        
        try {
            const messageData = {
                receiverId: userId,
                content: newMessage.trim()
            };
            
            const sentMessage = await messageService.sendMessage(messageData);
            setMessages(prev => [...prev, sentMessage]);
            
            socketService.sendPrivateMessage({
                receiverId: userId,
                senderId: user.id,
                message: newMessage.trim()
            });
            
            setNewMessage('');
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    const loadMoreMessages = async () => {
        if (!hasMore || loading) return;
        
        const nextPage = page + 1;
        
        try {
            setLoading(true);
            const data = await messageService.getConversation(userId, nextPage);
            setMessages(prev => [...data.messages.reverse(), ...prev]);
            setHasMore(data.currentPage < data.totalPages);
            setPage(nextPage);
        } catch (err) {
            console.error('Error loading more messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const markMessagesAsRead = async () => {
        try {
            await messageService.markMessagesAsRead(userId);
        } catch (err) {
            console.error('Error marking messages as read:', err);
        }
    };

    if (loading && !messages.length) {
        return (
            <div className="chat-container">
                <div className="loading-message">Loading conversation...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="chat-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="messages-page">
            <h1>Messages</h1>
            
            {messages.length === 0 ? (
                <div className="empty-message">
                    No messages yet. Start a conversation!
                </div>
            ) : (
                <div className="messages-list">
                    {messages.map((message, index) => {
                        const senderId = message.senderId?._id || message.senderId;
                        const isOutgoing = senderId === user.id;
                        const messageDate = new Date(message.createdAt).toLocaleDateString();
                        const showDateHeader = index === 0 || 
                            new Date(messages[index - 1].createdAt).toLocaleDateString() !== messageDate;
                        
                        if (isOutgoing) {
                            return (
                                <div key={message._id} className="message-entry">
                                    {showDateHeader && <div className="message-date">{messageDate}</div>}
                                    <div className="message-content outgoing">
                                        <div className="message-sender">You:</div>
                                        <div className="message-text">{message.content}</div>
                                        <div className="message-time">
                                            {new Date(message.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        } else {
                            return (
                                <div key={message._id} className="message-entry">
                                    {showDateHeader && <div className="message-date">{messageDate}</div>}
                                    <div className="message-content incoming">
                                        <div className="message-sender">{otherUser?.name || 'Unknown'}</div>
                                        <div className="message-text">{message.content}</div>
                                        <div className="message-time">
                                            {new Date(message.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    })}
                    <div ref={messagesEndRef} />
                </div>
            )}
            
            <form onSubmit={handleSendMessage} className="message-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="message-input"
                />
                <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="send-button"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chat;