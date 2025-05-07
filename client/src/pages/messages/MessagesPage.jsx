import { useState, useEffect } from 'react';
import MessageList from '../../components/common/MessageList';

const MessagesPage = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Messages</h1>
            <div className="max-w-4xl mx-auto">
                <MessageList />
            </div>
        </div>
    );
};

export default MessagesPage;