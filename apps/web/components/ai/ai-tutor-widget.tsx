'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import { usePathname } from 'next/navigation';

export function AiTutorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isMinimized]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      let subjectContext = 'General';
      if (pathname.includes('/student/assignments')) {
        subjectContext = 'Homework Help';
      } else if (pathname.includes('/student/content')) {
        subjectContext = 'Lesson Review';
      }

      const res = await apiClient.post('/ai/ask', {
        question: userMsg,
        subject: subjectContext,
        history: messages,
      });

      if (res.data?.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.data.answer }]);
      } else {
        throw new Error('Failed to get answer');
      }
    } catch (error) {
      console.error('AI Tutor error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'عذراً، واجهت مشكلة في الاتصال بالخادم. حاول مرة أخرى لاحقاً.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '500px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm">المعلم الذكي (AI Tutor)</h3>
                  <p className="text-[10px] opacity-80">يساعدك، ولا يعطيك الإجابة المباشرة!</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-primary-foreground/20 rounded-md transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-primary-foreground/20 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                  {messages.length === 0 && (
                    <div className="text-center text-sm text-gray-500 mt-10">
                      <Bot className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      مرحباً! أنا المعلم الذكي. لقد قرأت أسلوب التعلم المفضل لك من ملفك الذكي وسأشرح لك الدروس بالطريقة التي تحبها!
                    </div>
                  )}
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                      dir={msg.role === 'user' ? 'ltr' : 'rtl'}
                    >
                      <div 
                        className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                          msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                            : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-sm shadow-sm'
                        }`}
                        dir="rtl"
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-end">
                      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-2xl rounded-tl-sm shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 bg-background border-t">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="اسألني أي سؤال..."
                      className="flex-1 bg-gray-100 dark:bg-gray-800 border-transparent rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      dir="rtl"
                      disabled={isLoading}
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="rounded-full shrink-0"
                      disabled={!inputValue.trim() || isLoading}
                    >
                      <Send className="w-4 h-4 rtl:-scale-x-100" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
