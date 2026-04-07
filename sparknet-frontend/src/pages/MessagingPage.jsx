import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import socket from '../api/socket';
import toast from 'react-hot-toast';

export const MessagingPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [receiverId, setReceiverId] = useState(''); // Simple input for demo
  const scrollRef = useRef();

  useEffect(() => {
    // Listen for incoming messages
    socket.on('RECEIVE_MESSAGE', (message) => {
      setMessages((prev) => [...prev, message]);
      toast.success(`New message from ${message.senderName || 'someone'}`);
    });

    return () => {
      socket.off('RECEIVE_MESSAGE');
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!content.trim() || !receiverId.trim()) return;

    socket.emit('SEND_MESSAGE', { receiverId, content }, (response) => {
      if (response.success) {
        setMessages((prev) => [...prev, response.message]);
        setContent('');
      } else {
        toast.error(response.error || 'Failed to send');
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col page-enter">
      <div className="mb-6">
        <h1 className="font-display font-800 text-3xl text-white">Messages</h1>
        <p className="text-gray-500 mt-1">Real-time chat powered by WebSockets</p>
      </div>

      <div className="flex-1 spark-card overflow-hidden flex flex-col">
        {/* Simple Receiver ID Input for Demo */}
        <div className="p-4 border-b border-dark-600 bg-dark-800/50 flex items-center gap-4">
          <label className="text-xs font-mono text-gray-500 uppercase">Chat With User ID:</label>
          <input 
            type="text" 
            value={receiverId} 
            onChange={(e) => setReceiverId(e.target.value)}
            placeholder="Enter Receiver User ID"
            className="spark-input py-1 text-xs max-w-[240px]"
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-600 italic">
              No messages yet in this session.
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.senderId === (user._id || user.id) ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-3 rounded-2xl ${msg.senderId === (user._id || user.id) ? 'bg-spark-500 text-white rounded-tr-none' : 'bg-dark-700 text-gray-200 rounded-tl-none border border-dark-600'}`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-[10px] opacity-50 mt-1 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="p-4 bg-dark-800 border-t border-dark-600 flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 spark-input"
          />
          <button type="submit" className="spark-btn-primary px-6">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
