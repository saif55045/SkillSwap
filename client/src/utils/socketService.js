import io from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
    }
    
    connect(token) {
        if (this.socket && this.isConnected) return;

        this.socket = io('http://localhost:5000', {
            auth: {
                token: token || localStorage.getItem('token')
            }
        });
        
        this.socket.on('connect', () => {
            console.log('Socket connected');
            this.isConnected = true;
        });
        
        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.isConnected = false;
        });
        
        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
        
        return this.socket;
    }
    
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }
    
    getSocket() {
        if (!this.socket || !this.isConnected) {
            return this.connect();
        }
        return this.socket;
    }
    
    // Join a project room to receive bid updates
    joinProject(projectId) {
        const socket = this.getSocket();
        socket.emit('join_project', projectId);
    }
    
    // Leave a project room
    leaveProject(projectId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('leave_project', projectId);
        }
    }
    
    // Join a chat room for direct messaging
    joinChat(userId) {
        const socket = this.getSocket();
        socket.emit('join_chat', userId);
        return socket;
    }
    
    // Send a private message
    sendPrivateMessage(data) {
        const socket = this.getSocket();
        socket.emit('private_message', data);
    }
    
    // Subscribe to message events
    subscribeToMessages(callbacks) {
        const socket = this.getSocket();
        
        if (callbacks.onNewMessage) {
            socket.on('receive_message', callbacks.onNewMessage);
        }
        
        if (callbacks.onMessageRead) {
            socket.on('message_read', callbacks.onMessageRead);
        }
        
        return () => {
            if (callbacks.onNewMessage) {
                socket.off('receive_message', callbacks.onNewMessage);
            }
            
            if (callbacks.onMessageRead) {
                socket.off('message_read', callbacks.onMessageRead);
            }
        };
    }
    
    // Subscribe to bid events
    subscribeToProjectBids(projectId, callbacks) {
        const socket = this.getSocket();
        
        if (callbacks.onNewBid) {
            socket.on('new_bid', callbacks.onNewBid);
        }
        
        if (callbacks.onBidStatusUpdated) {
            socket.on('bid_status_updated', callbacks.onBidStatusUpdated);
        }
        
        if (callbacks.onCounterOfferReceived) {
            socket.on('counter_offer_received', callbacks.onCounterOfferReceived);
        }
        
        if (callbacks.onCounterOfferAccepted) {
            socket.on('counter_offer_accepted', callbacks.onCounterOfferAccepted);
        }
        
        // Join the project room
        this.joinProject(projectId);
    }
    
    // Unsubscribe from bid events
    unsubscribeFromProjectBids(callbacks) {
        if (!this.socket || !this.isConnected) return;
        
        if (callbacks.onNewBid) {
            this.socket.off('new_bid', callbacks.onNewBid);
        }
        
        if (callbacks.onBidStatusUpdated) {
            this.socket.off('bid_status_updated', callbacks.onBidStatusUpdated);
        }
        
        if (callbacks.onCounterOfferReceived) {
            this.socket.off('counter_offer_received', callbacks.onCounterOfferReceived);
        }
        
        if (callbacks.onCounterOfferAccepted) {
            this.socket.off('counter_offer_accepted', callbacks.onCounterOfferAccepted);
        }
    }
}

export const socketService = new SocketService();