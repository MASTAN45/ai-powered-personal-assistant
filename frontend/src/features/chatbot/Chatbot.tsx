import { useEffect, useRef, useState } from 'react';
import { useChatbotStore, ChatMessage } from '../../stores/chatbotStore';
import { X, Minimize2, Maximize2, Send, Sparkles, Plus } from 'lucide-react';

export function Chatbot() {
  const {
    isOpen,
    isMinimized,
    messages,
    isLoading,
    error,
    providerStatus,
    pendingAction,
    toggleMinimize,
    toggleOpen,
    sendMessage,
    newSession,
    getProviderStatus,
    confirmAction,
    cancelAction,
  } = useChatbotStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      getProviderStatus();
    }
  }, [isOpen, getProviderStatus]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedPrompts = [
    'Summarize my pending emails',
    'Find urgent conversations',
    'Show upcoming deadlines',
    'Draft a professional reply',
    'What needs my attention?',
  ];

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-[1080] flex flex-col bg-white dark:bg-dark-surface rounded-lg shadow-premium-lg transition-all duration-300 ${isMinimized ? 'h-14 w-80' : 'h-[600px] w-96'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-light-border dark:border-dark-border bg-gradient-to-r from-brand-red-500 to-brand-yellow-500">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5" />
          <div>
            <h3 className="font-semibold text-sm">Email Intelligence Copilot</h3>
            <p className="text-xs opacity-90">
              {providerStatus?.provider === 'gemini' ? `Gemini ${providerStatus.model}` : 'Rule-based AI'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={newSession}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="New chat"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={toggleMinimize}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4 text-white" />
            ) : (
              <Minimize2 className="w-4 h-4 text-white" />
            )}
          </button>
          <button
            onClick={toggleOpen}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-brand-yellow-500" />
                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                  How can I help you manage your emails today?
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(prompt);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1.5 text-xs bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-full hover:border-brand-red-500 hover:text-brand-red-500 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message: ChatMessage) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-brand-red-500 text-white'
                      : 'bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content.split('\n').map((line, idx) => (<div key={idx}>{line || '\u00A0'}</div>))}</div>
                  {message.provider && (
                    <p className="text-xs opacity-70 mt-1">
                      {message.provider === 'gemini' ? 'Ã¢Å“Â¨ Gemini' : 'Ã°Å¸Â¤â€“ Fallback'}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-brand-yellow-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-brand-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-brand-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Pending Action Confirmation */}
            {pendingAction && (
              <div className="bg-brand-yellow-50 dark:bg-brand-yellow-900/20 border-2 border-brand-yellow-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-yellow-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">⚠</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-light-text-primary dark:text-dark-text-primary mb-1">
                      Confirm Action Required
                    </h4>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3">
                      {pendingAction.description}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={confirmAction}
                        disabled={isLoading}
                        className="px-4 py-2 bg-brand-green-500 text-white text-sm font-medium rounded-lg hover:bg-brand-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ✓ Confirm
                      </button>
                      <button
                        onClick={cancelAction}
                        disabled={isLoading}
                        className="px-4 py-2 bg-light-border dark:bg-dark-border text-light-text-primary dark:text-dark-text-primary text-sm font-medium rounded-lg hover:bg-light-border/80 dark:hover:bg-dark-border/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-light-border dark:border-dark-border p-4">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your emails..."
                className="flex-1 resize-none bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red-500 max-h-32"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 bg-brand-red-500 text-white rounded-lg hover:bg-brand-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// Floating button to open chatbot
export function ChatbotButton() {
  const { toggleOpen, isOpen } = useChatbotStore();

  if (isOpen) return null;

  return (
    <button
      onClick={toggleOpen}
      className="fixed bottom-4 right-4 z-[1080] p-4 bg-gradient-to-r from-brand-red-500 to-brand-yellow-500 text-white rounded-full shadow-premium-lg hover:shadow-premium transition-all hover:scale-110"
      aria-label="Open AI Assistant"
    >
      <Sparkles className="w-6 h-6 animate-pulse" />
    </button>
  );
}