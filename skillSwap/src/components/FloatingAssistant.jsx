import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, ChevronDown } from 'lucide-react';
import { askAssistant } from '../services/api';

const INITIAL_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: "Hi there! 👋 I'm **DBU Assistant**, your campus guide.\n\nAsk me about departments, registration, academic calendar, campus rules, or anything DBU-related!",
  time: new Date(),
};

const SAMPLE_PROMPTS = [
  "📅 Academic calendar",
  "📝 Registration steps",
  "🏛️ List departments",
  "📖 Campus rules",
];

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setShowPulse(false);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', text: text.trim(), time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await askAssistant({ question: text.trim() });
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: response.answer,
        sources: response.sources,
        time: new Date(),
      }]);
    } catch (err) {
      console.error("Assistant error:", err);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: "I'm having a little trouble connecting right now. Please try again in a moment!",
        time: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handlePromptClick = (prompt) => {
    sendMessage(prompt);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Simple markdown-ish bold rendering
  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* ===== Chat Panel ===== */}
      <div style={{
        position: 'fixed',
        bottom: 90,
        right: 20,
        width: 380,
        maxWidth: 'calc(100vw - 40px)',
        height: 520,
        maxHeight: 'calc(100vh - 140px)',
        zIndex: 9998,
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: '#0d0d14',
        border: '1px solid rgba(108, 99, 255, 0.2)',
        boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 40px rgba(108, 99, 255, 0.1)',
        transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'all' : 'none',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 18px',
          background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.15), rgba(78, 205, 196, 0.1))',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Bot size={22} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: '#fff', margin: 0 }}>
              DBU Assistant
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#44CF6C', boxShadow: '0 0 6px #44CF6C' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Online · Powered by AI</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10,
              width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--color-text-muted)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            <ChevronDown size={18} />
          </button>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px 14px',
          display: 'flex', flexDirection: 'column', gap: 14,
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.08) transparent',
        }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              gap: 8,
              alignItems: 'flex-end',
            }}>
              {/* Avatar */}
              {msg.role === 'assistant' && (
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={14} color="#fff" />
                </div>
              )}

              {/* Bubble */}
              <div style={{
                maxWidth: '80%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user'
                  ? '16px 16px 4px 16px'
                  : '16px 16px 16px 4px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #6C63FF, #5A52E0)'
                  : 'rgba(255,255,255,0.06)',
                border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
                color: '#fff',
                fontSize: '0.84rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {renderText(msg.text)}
                <div style={{
                  fontSize: '0.65rem',
                  color: msg.role === 'user' ? 'rgba(255,255,255,0.5)' : 'var(--color-text-muted)',
                  marginTop: 4,
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                }}>
                  {formatTime(msg.time)}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={14} color="#fff" />
              </div>
              <div style={{
                padding: '12px 16px', borderRadius: '16px 16px 16px 4px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', gap: 4, alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'rgba(108, 99, 255, 0.7)',
                    animation: `typingBounce 1.4s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Quick prompts — show when only the welcome message exists */}
          {messages.length === 1 && !isTyping && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {SAMPLE_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handlePromptClick(prompt)}
                  style={{
                    padding: '7px 12px', borderRadius: 20,
                    border: '1px solid rgba(108, 99, 255, 0.25)',
                    background: 'rgba(108, 99, 255, 0.08)',
                    color: '#8B83FF', fontSize: '0.78rem', fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.2s',
                    fontFamily: 'var(--font-body)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108, 99, 255, 0.2)'; e.currentTarget.style.borderColor = 'rgba(108, 99, 255, 0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(108, 99, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(108, 99, 255, 0.25)'; }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} style={{
          padding: '12px 14px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about DBU..."
            style={{
              flex: 1, padding: '10px 14px',
              borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
              color: '#fff', fontSize: '0.85rem',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(108, 99, 255, 0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            style={{
              width: 40, height: 40, borderRadius: 12, border: 'none',
              background: input.trim() && !isTyping
                ? 'linear-gradient(135deg, #6C63FF, #4ECDC4)'
                : 'rgba(255,255,255,0.06)',
              color: '#fff', cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.2s',
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* ===== Floating Action Button ===== */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Open DBU Assistant"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 20,
          zIndex: 9999,
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: 'none',
          background: isOpen
            ? 'rgba(255,255,255,0.1)'
            : 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
          boxShadow: isOpen
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 8px 30px rgba(108, 99, 255, 0.4), 0 0 0 0 rgba(108, 99, 255, 0.3)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: isOpen ? 'rotate(0deg)' : 'rotate(0deg)',
          animation: showPulse && !isOpen ? 'fabPulse 2s ease-in-out infinite' : 'none',
        }}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={24} />}
      </button>

      {/* ===== Animations ===== */}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fabPulse {
          0% { box-shadow: 0 8px 30px rgba(108, 99, 255, 0.4), 0 0 0 0 rgba(108, 99, 255, 0.3); }
          50% { box-shadow: 0 8px 30px rgba(108, 99, 255, 0.4), 0 0 0 12px rgba(108, 99, 255, 0); }
          100% { box-shadow: 0 8px 30px rgba(108, 99, 255, 0.4), 0 0 0 0 rgba(108, 99, 255, 0); }
        }

        @media (max-width: 640px) {
          /* Make the chat panel full-width on mobile and account for bottom nav */
        }
      `}</style>
    </>
  );
}



