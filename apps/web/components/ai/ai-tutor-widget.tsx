'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { aiApi } from '@/lib/api/ai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isMock?: boolean;
}

export function AiTutorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: 'أهلاً بك! أنا مساعدك الذكي NEXUS. كيف يمكنني مساعدتك في دراستك اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent, customInput?: string) => {
    if (e) e.preventDefault();
    const textToSend = customInput || input;
    if (!textToSend.trim() || isLoading) return;

    if (!customInput) {
      const userMsg: Message = { id: Date.now().toString(), role: 'user', content: textToSend };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
    }

    setIsLoading(true);

    try {
      const res = await aiApi.ask(textToSend);
      if (res.data.success) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.data.data.answer,
          isMock: res.data.data.isMock
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: 'عذراً، حدث خطأ ما. حاول مرة أخرى.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-2xl bg-primary-600 hover:bg-primary-700 transition-all duration-300 z-50 group"
        >
          <Bot className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary-500"></span>
          </span>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 w-[380px] h-[550px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">

          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 flex items-center justify-between text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold text-lg">مساعد الذكاء الاصطناعي</div>
                <div className="text-[10px] text-primary-100 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
                  متصل الآن
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                title="خطة دراسية"
                onClick={() => {
                  if (!isLoading) {
                    const msg = { id: Date.now().toString(), role: 'user' as const, content: 'ساعدني في وضع خطة دراسية' };
                    setMessages(prev => [...prev, msg]);
                    handleSubmit(null as any, 'ساعدني في وضع خطة دراسية');
                  }
                }}
                className="hover:bg-white/20 text-white rounded-full h-10 w-10"
              >
                <Sparkles className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 text-white rounded-full h-10 w-10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 bg-gray-50/50 dark:bg-gray-900/50" ref={scrollRef as any}>
            <div className="space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={cn(
                  "flex w-full",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                    msg.role === 'user'
                      ? "bg-primary-600 text-white rounded-br-none"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-none"
                  )}>
                    {msg.content}
                    {msg.isMock && <div className="text-[10px] opacity-60 mt-2 italic border-t border-black/5 pt-1">استجابة تجريبية ذكية</div>}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start w-full">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700 flex items-center gap-3 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                    <span className="text-xs text-gray-500 italic">جاري التفكير...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t bg-white dark:bg-gray-950">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="اسأل أي شيء..."
                className="flex-1 bg-gray-50 dark:bg-gray-900 border-none focus-visible:ring-1 focus-visible:ring-primary-500 rounded-xl"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="rounded-xl bg-primary-600 hover:bg-primary-700 h-10 w-10 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => setInput("اشرح لي درس اليوم")}
                className="text-[10px] px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-gray-600 dark:text-gray-400 rounded-full transition-colors border border-gray-200 dark:border-gray-700"
              >
                اشرح لي الدرس
              </button>
              <button
                type="button"
                onClick={() => setInput("عندي سؤال في الواجب")}
                className="text-[10px] px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-gray-600 dark:text-gray-400 rounded-full transition-colors border border-gray-200 dark:border-gray-700"
              >
                سؤال في الواجب
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
