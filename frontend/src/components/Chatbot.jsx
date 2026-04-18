import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, MessageCircle, SendHorizonal, Sparkles, X } from 'lucide-react';
import { getApiErrorMessage, sendChatMessage } from '../services/api';

const starterMessage = {
  id: 'starter-bot-message',
  role: 'bot',
  content:
    'Hi! I can help with colleges, ranks, fees, courses, and stream guidance. Ask me anything.',
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([starterMessage]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || sending) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedInput,
    };

    const previousMessages = messages.filter((message) => message.id !== starterMessage.id);

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const response = await sendChatMessage({
        message: trimmedInput,
        history: previousMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'bot',
          content: response.reply,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'bot',
          content: getApiErrorMessage(
            error,
            'I could not respond right now. Please check the backend and Gemini API key.'
          ),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-2xl shadow-slate-900/15 backdrop-blur-xl"
          >
            <div className="bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.85),_transparent_35%),linear-gradient(135deg,#0f172a,#1d4ed8)] px-5 py-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-cyan-100">
                    <Sparkles size={16} />
                    <p className="text-xs uppercase tracking-[0.24em]">Aarohan AI</p>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold">College Help Chat</h2>
                  <p className="mt-1 text-sm text-blue-100">
                    Ask about colleges, cutoffs, fees, or courses.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="h-80 space-y-3 overflow-y-auto bg-gradient-to-b from-slate-50 to-blue-50/50 px-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      message.role === 'user'
                        ? 'rounded-br-md bg-blue-600 text-white'
                        : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {message.role === 'bot' && (
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                        <Bot size={14} />
                        Bot
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t border-slate-200/70 bg-white/90 p-4">
              <div className="flex items-end gap-3">
                <textarea
                  rows="1"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Type your question..."
                  className="max-h-28 min-h-[52px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-400/30"
                />

                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <SendHorizonal size={18} />
                </button>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-slate-950 via-blue-700 to-violet-700 px-5 py-4 text-sm font-semibold text-white shadow-2xl shadow-slate-900/30"
      >
        <div className="rounded-full bg-blue-500/20 p-2 text-cyan-200">
          <MessageCircle size={18} />
        </div>
        {isOpen ? 'Close Chat' : 'Ask Aarohan AI'}
      </motion.button>
    </div>
  );
};

export default Chatbot;
