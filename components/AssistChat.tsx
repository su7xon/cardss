import React, { useState, useRef, useEffect } from 'react';
import { sendMessage, ChatMessage } from '../services/groqService';

interface AssistChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const AssistChat: React.FC<AssistChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hey there! 👋 Welcome to Healing Crystal Sutra. I\'m here if you have any questions about crystals, our services, or just want to chat. What\'s on your mind?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const allMessages = [...messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) !== 0), userMessage];
      const response = await sendMessage(allMessages.slice(-10)); // Keep last 10 messages for context
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, I\'m having trouble connecting right now. Please try again or contact us via WhatsApp at +91 7042620928 ✨' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-md h-[600px] max-h-[80vh] rounded-3xl border border-rose-500/20 shadow-2xl flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-rose-500 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
            🔮
          </div>
          <div className="flex-grow">
            <h3 className="font-bold text-white">Assist</h3>
            <p className="text-white/70 text-xs">Your Spiritual AI Guide</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl w-10 h-10 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-rose-500 text-white rounded-br-sm' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-sm'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about crystals, astrology..."
              className="flex-grow bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-rose-500 text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-xl font-bold transition-colors"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistChat;
