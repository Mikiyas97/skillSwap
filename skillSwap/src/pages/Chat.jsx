import { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Send, ArrowLeft, Search } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../context/AuthContext';
import { fetchConversations, fetchMessages, sendMessageAPI, markMessagesRead } from '../services/api';

export default function Chat() {
  const { user } = useAuth();
  const location = useLocation();
  const targetUser = location.state?.targetUser;

  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const currentUserId = String(user?.id || '1');

  // Load contacts
  useEffect(() => {
    async function loadContacts() {
      try {
        const convs = await fetchConversations();
        let contactList = convs.flatMap(c =>
          (c.participants || []).filter(p => String(p.id) !== currentUserId).map(p => ({
            id: String(p.id),
            name: p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim(),
            department: p.department || '',
            online: p.online || false,
            avatar: p.avatar || '',
            unreadCount: c.unread_count || 0,
          }))
        );

        // If a targetUser was passed via routing, ensure they are in the list and select them
        if (targetUser && String(targetUser.id) !== currentUserId) {
          const mappedTarget = {
            id: String(targetUser.id),
            name: targetUser.name || `${targetUser.first_name || ''} ${targetUser.last_name || ''}`.trim(),
            department: targetUser.department || '',
            online: targetUser.online || false,
            avatar: targetUser.avatar || '',
            unreadCount: 0,
          };

          // Remove if they already exist so we can push them to the top
          contactList = contactList.filter(c => String(c.id) !== String(targetUser.id));
          contactList.unshift(mappedTarget);
          
          setSelectedContact(mappedTarget);
          
          // Clear history state to avoid re-triggering if user refreshes
          window.history.replaceState({}, document.title);
        }

        setContacts(contactList);
      } catch (err) {
        console.error("Failed to load contacts:", err);
        setContacts([]);
      }
    }
    loadContacts();
  }, [currentUserId, targetUser]);

  // Load messages when contact selected + poll for new messages
  useEffect(() => {
    if (!selectedContact) return;
    let isMounted = true;

    async function loadMessages() {
      try {
        const msgs = await fetchMessages(selectedContact.id);
        if (isMounted) {
          setMessages(prev => {
            if (prev.length !== msgs.length) return msgs;
            return prev;
          });

          // Clear local unread count for this contact immediately
          setContacts(prev => prev.map(c => 
            c.id === selectedContact.id ? { ...c, unreadCount: 0 } : c
          ));

          await markMessagesRead(selectedContact.id);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    }

    // Initial load
    loadMessages();

    // Poll every 3 seconds
    const intervalId = setInterval(loadMessages, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [selectedContact, currentUserId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;
    const localMsg = { id: Date.now().toString(), senderId: currentUserId, receiverId: selectedContact.id, text: newMessage, timestamp: new Date().toISOString(), read: false };
    setMessages(prev => [...prev, localMsg]);
    setNewMessage('');

    try {
      await sendMessageAPI(selectedContact.id, newMessage);
    } catch {
      // Message already shown locally, API will sync later
    }
  };

  return (
    <div className="chat-container">
      {/* Contacts sidebar */}
      <div className={`chat-sidebar ${selectedContact ? 'chat-hidden' : ''}`}>
        <div style={{ padding: '16px 16px 12px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.15rem', marginBottom: 12 }}>Messages</h2>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input className="input-field" placeholder="Search contacts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ paddingLeft: 36, fontSize: '0.85rem' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {filteredContacts.map(contact => (
            <button key={contact.id} onClick={() => setSelectedContact(contact)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              background: selectedContact?.id === contact.id ? 'rgba(108,99,255,0.1)' : 'transparent',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'all 0.2s',
              minHeight: 64,
            }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Avatar name={contact.name} size={40} />
                {contact.online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#44CF6C', border: '2px solid var(--color-dark-800)' }} />}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{contact.name}</p>
                <p className="text-truncate" style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{contact.department}</p>
              </div>
              {contact.unreadCount > 0 && (
                <div style={{
                  background: '#EF4444', color: '#fff', fontSize: '0.65rem',
                  fontWeight: 800, width: 20, height: 20, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {contact.unreadCount > 9 ? '9+' : contact.unreadCount}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className={`chat-main ${selectedContact ? 'chat-visible' : ''}`}>
        {selectedContact ? (
          <>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-dark-800)', flexShrink: 0 }}>
              <button onClick={() => setSelectedContact(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 6, minWidth: 36, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={20} /></button>
              <Link to={`/user/${selectedContact.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0 }}>
                <Avatar name={selectedContact.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="text-truncate" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{selectedContact.name}</p>
                  <p style={{ fontSize: '0.72rem', color: selectedContact.online ? '#44CF6C' : 'var(--color-text-muted)' }}>{selectedContact.online ? 'Online' : 'Offline'}</p>
                </div>
              </Link>
            </div>

            <div className="scroll-smooth" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map(msg => {
                const isMe = String(msg.senderId) === currentUserId;
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div className="message-bubble" style={{
                      padding: '10px 14px',
                      borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isMe ? 'linear-gradient(135deg, #6C63FF, #5A52E0)' : 'var(--color-dark-700)',
                      color: isMe ? '#fff' : 'var(--color-text-primary)',
                    }}>
                      <p className="text-break" style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>{msg.text}</p>
                      <p style={{ fontSize: '0.68rem', marginTop: 3, opacity: 0.6, textAlign: 'right' }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'var(--color-dark-800)', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input-field" placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }} style={{ flex: 1 }} />
                <button onClick={sendMessage} className="btn-primary btn-inline" style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', width: 'auto', minWidth: 48 }}><Send size={18} /></button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', padding: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><Send size={24} style={{ color: 'var(--color-primary)' }} /></div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 6 }}>Select a conversation</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>Choose a contact to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
