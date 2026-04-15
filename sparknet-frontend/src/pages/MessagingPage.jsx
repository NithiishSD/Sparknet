import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import socket from '../api/socket';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const MessagingPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef();

  // ── Load conversations and following list ────────────────────────────────
  useEffect(() => {
    const fetchConversationsAndFollowing = async () => {
      if (!user) return;
      try {
        setLoadingConvs(true);
        const [convRes, followingRes] = await Promise.all([
          api.get('/messaging/conversations').catch(() => ({ data: { conversations: [] } })),
          api.get('/users/following').catch(() => ({ data: { following: [] } }))
        ]);
        
        const convs = convRes.data?.conversations || convRes.data?.data || [];
        const following = followingRes.data?.following || [];
        
        // Find existing conversation partners to avoid duplicates
        const convUserIds = new Set();
        convs.forEach(c => {
           const other = c.participants?.find(p => (p._id || p) !== (user._id || user.id));
           // If populated as object, otherwise string id
           if (other) convUserIds.add(other._id || other);
        });
        
        const ghosts = following.filter(f => !convUserIds.has(f._id)).map(f => ({
           _id: 'ghost_' + f._id,
           isGhost: true,
           participants: [{_id: user._id || user.id}, f], // inject standard structure
           lastMessage: null
        }));
        
        setConversations([...convs, ...ghosts]);
      } catch (err) {
        console.error('Failed to load messaging data:', err);
      } finally {
        setLoadingConvs(false);
      }
    };
    fetchConversationsAndFollowing();
  }, [user]);

  // ── Load full message history when selecting a conversation ──────────────
  const handleSelectConv = async (conv) => {
    setSelectedConv(conv);
    setMessages([]);
    if (conv.isGhost) return; // No messages exist yet for ghosts
    
    setLoadingMsgs(true);
    try {
      const { data } = await api.get(`/messaging/conversations/${conv._id}/messages`);
      if (data.success) setMessages(data.messages || data.data || []);
      // Mark as read
      await api.patch(`/messaging/conversations/${conv._id}/read`).catch(() => {});
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMsgs(false);
    }
  };

  // ── Socket listener for real-time new messages ─────────────────────────
  useEffect(() => {
    socket.on('RECEIVE_MESSAGE', (message) => {
      if (selectedConv && message.conversationId === selectedConv._id) {
        setMessages((prev) => [...prev, message]);
      }
      // Update conversation list preview
      setConversations(prev => prev.map(c =>
        c._id === message.conversationId ? { ...c, lastMessage: message } : c
      ));
      const senderName = message.senderName || 'Someone';
      toast.success(`New message from ${senderName}`);
    });
    return () => socket.off('RECEIVE_MESSAGE');
  }, [selectedConv]);

  // ── Auto-scroll on new messages ────────────────────────────────────────
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send message ───────────────────────────────────────────────────────
  const sendMessage = (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedConv) return;

    const otherParticipant = selectedConv.participants?.find(
      p => (p._id || p) !== (user._id || user.id)
    );
    const receiverId = otherParticipant?._id || otherParticipant;

    const payload = { receiverId, content };
    if (!selectedConv.isGhost) payload.conversationId = selectedConv._id;

    socket.emit('SEND_MESSAGE', payload, async (response) => {
      if (response?.success) {
        setMessages((prev) => [...prev, response.message]);
        setContent('');
        // If this was a ghost, it is now an active conversation. We must update the ID globally.
        if (selectedConv.isGhost) {
           setSelectedConv(prev => ({ ...prev, _id: response.message.conversationId, isGhost: false }));
           // Re-fetch to normalize list
           try {
             const { data } = await api.get('/messaging/conversations');
             if (data.success) {
                // Ensure we inject any remaining ghosts with the new real conversations
                setConversations(prevConvs => {
                   const active = data.conversations || [];
                   const activeUserIds = new Set(active.map(c => {
                      const other = c.participants?.find(p => (p._id || p) !== (user._id || user.id));
                      return other?._id || other;
                   }));
                   const ghosts = prevConvs.filter(c => c.isGhost && !activeUserIds.has(c.participants[1]?._id));
                   return [...active, ...ghosts];
                });
             }
           } catch (e) {}
        }
      } else {
        toast.error(response?.error || 'Failed to send');
      }
    });
  };

  const getOtherParticipant = (conv) => {
    if (!conv?.participants) return null;
    return conv.participants.find(p => {
      const pId = p._id || p;
      const myId = user?._id || user?.id;
      return String(pId) !== String(myId);
    });
  };

  const filteredConvs = conversations.filter(c => {
    const other = getOtherParticipant(c);
    return other?.username?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loadingConvs) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-outline-variant/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role === 'admin') {
    return (
      <div className="flex flex-1 h-[calc(100vh-4rem)] items-center justify-center bg-background page-enter">
         <div className="text-center">
            <span className="material-symbols-outlined text-6xl opacity-30 mb-4 text-slate-500">lock</span>
            <p className="font-headline tracking-widest uppercase text-sm text-slate-400">Messaging is disabled for Command units</p>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-[calc(100vh-4rem)] bg-background page-enter">
      
      {/* ── Inbox Sidebar ─────────────────────────────────── */}
      <section className="w-full md:w-80 border-r border-outline-variant/15 flex flex-col bg-surface-container-low">
        <div className="p-6 border-b border-outline-variant/10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Messages</h1>
          </div>
          <div className="relative">
            <input 
              className="input-base pl-11 !rounded-xl !bg-surface-container-lowest" 
              placeholder="Search conversations..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
               <span className="material-symbols-outlined text-4xl text-outline-variant mb-4 font-light">chat_bubble</span>
               <p className="font-headline text-slate-400 font-semibold mb-2">No Conversations Yet</p>
               <p className="text-xs text-slate-500 mb-6">Follow people to start a conversation.</p>
               <a href="/search" className="btn-secondary text-sm px-4 py-2">Find People</a>
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">No matches found.</div>
          ) : (
            filteredConvs.map((conv) => {
              const other = getOtherParticipant(conv);
              const isSelected = selectedConv?._id === conv._id;
              return (
                <div
                  key={conv._id}
                  onClick={() => handleSelectConv(conv)}
                  className={`p-4 flex items-center gap-4 cursor-pointer transition-colors group border-l-4 ${
                    isSelected ? 'bg-surface-container border-primary' : 'hover:bg-surface-container border-transparent'
                  }`}
                >
                  <div className="relative">
                    {other?.oauthAvatarUrl ? (
                      <img
                        className="w-12 h-12 rounded-full object-cover"
                        src={other.oauthAvatarUrl}
                        alt="avatar"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-slate-400 font-headline font-bold uppercase">
                        {other?.username?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className={`font-headline font-semibold truncate ${isSelected ? 'text-on-surface' : 'text-slate-400 group-hover:text-on-surface'}`}>
                        {other?.username || 'Unknown'}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ── Chat Canvas ──────────────────────────────────── */}
      <section className="hidden md:flex flex-1 flex-col bg-surface overflow-hidden relative">
        {!selectedConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
             <span className="material-symbols-outlined text-6xl opacity-30 mb-4" style={{ fontVariationSettings: "'wght' 200" }}>forum</span>
             <p className="font-headline tracking-widest uppercase text-sm">Select a conversation</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            {(() => {
              const other = getOtherParticipant(selectedConv);
              return (
                <div className="h-20 px-8 flex items-center justify-between border-b border-outline-variant/10 z-10 shrink-0 bg-surface-container-low">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-primary/20">
                      {other?.oauthAvatarUrl ? (
                        <img className="w-full h-full object-cover" src={other.oauthAvatarUrl} alt="avatar" />
                      ) : (
                        <div className="w-full h-full bg-surface-container-highest flex items-center justify-center text-slate-400 font-headline font-bold uppercase">
                          {other?.username?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="font-headline font-bold text-on-surface tracking-tight">{other?.username || 'Unknown'}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary pulse-dot" />
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-headline">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-4 custom-scrollbar">
              {loadingMsgs ? (
                <div className="flex justify-center mt-8">
                  <div className="w-8 h-8 border-4 border-outline-variant/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12">
                   <p className="text-sm text-slate-500 font-headline uppercase tracking-widest">No messages yet — say hello!</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isOwn = String(msg.senderId || msg.sender) === String(user._id || user.id);
                  return (
                    <div key={i} className={`flex items-start gap-3 max-w-2xl ${isOwn ? 'self-end flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full border shrink-0 flex items-center justify-center font-bold text-[10px] ${
                        isOwn
                        ? 'bg-primary-container text-on-primary-container border-primary/20'
                        : 'bg-surface-container text-slate-400 border-outline-variant/30'
                      }`}>
                         {isOwn ? 'ME' : getOtherParticipant(selectedConv)?.username?.substring(0, 2)?.toUpperCase()}
                      </div>
                      <div className={`flex flex-col gap-1 ${isOwn ? 'items-end' : ''}`}>
                        <div className={`p-4 text-sm leading-relaxed ${
                          isOwn
                          ? 'bg-gradient-to-br from-primary-container to-primary text-on-primary shadow-[0_4px_20px_rgba(173,198,255,0.2)] rounded-l-2xl rounded-br-2xl font-medium'
                          : 'bg-surface-container text-on-surface rounded-r-2xl rounded-bl-2xl border border-outline-variant/20'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-slate-600">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 shrink-0 border-t border-outline-variant/10">
              <form onSubmit={sendMessage} className="flex items-end gap-3 bg-surface-container-low p-3 rounded-2xl border border-outline-variant/20 focus-within:border-primary/40 transition-all">
                <textarea
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 resize-none text-on-surface placeholder:text-slate-600 outline-none"
                  placeholder="Type a message..."
                  rows="1"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!content.trim()}
                  className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                </button>
              </form>
            </div>
          </>
        )}
      </section>
    </div>
  );
};
