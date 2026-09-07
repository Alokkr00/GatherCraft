'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Megaphone, Sparkles, Heart, Clock, 
  ShieldCheck, Radio, AlertTriangle 
} from 'lucide-react';

export interface ChatMessageItem {
  id: string;
  senderName: string;
  senderRole: string;
  content: string;
  phase: 'PLANNING' | 'LIVE' | 'GRATITUDE' | 'ARCHIVED';
  isBroadcast: boolean;
  createdAt: string;
}

interface Props {
  eventId: string;
  purposeStatement?: string;
  currentPhase: 'planning' | 'live' | 'completed';
  isHost?: boolean;
  currentUserName: string;
  currentUserRole?: 'host' | 'co-host' | 'guest';
}

export default function StreamlinedEventChat({
  eventId,
  purposeStatement,
  currentPhase,
  isHost = false,
  currentUserName,
  currentUserRole = 'guest',
}: Props) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMegaphoneActive, setIsMegaphoneActive] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUp = useRef(false);

  const mappedPhase = currentPhase === 'planning' ? 'PLANNING' : currentPhase === 'live' ? 'LIVE' : 'GRATITUDE';

  const handleScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isUserScrolledUp.current = distanceToBottom > 60;
  };

  const loadMessages = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/chat`);
      if (res.ok) {
        const data = await res.json();
        const incoming: ChatMessageItem[] = data.messages || [];
        setMessages((prev) => {
          if (prev.length === incoming.length && prev.length > 0) {
            const lastPrev = prev[prev.length - 1];
            const lastIncoming = incoming[incoming.length - 1];
            if (lastPrev.id === lastIncoming.id) {
              return prev;
            }
          }
          return incoming;
        });
      }
    } catch (err) {
      console.warn('Could not load chat messages:', err);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        loadMessages();
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [eventId]);

  useEffect(() => {
    if (!isUserScrolledUp.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const content = inputText.trim();
    const isBroadcast = isHost && isMegaphoneActive && currentPhase === 'live';

    // 1. Optimistic append
    const optimisticMsg: ChatMessageItem = {
      id: `temp_${Date.now()}`,
      senderName: currentUserName,
      senderRole: currentUserRole,
      content,
      phase: mappedPhase,
      isBroadcast,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch(`/api/events/${eventId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: currentUserName,
          content,
          senderRole: currentUserRole,
          phase: mappedPhase,
          isBroadcast,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === optimisticMsg.id ? data.message : m)));
      }
    } catch (err) {
      console.error('Failed to post message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl border border-slate-800 flex flex-col h-[520px] overflow-hidden shadow-2xl">
      {/* 1. Top Bar: Purpose & Phase Anchor */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            {currentPhase === 'planning' && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Planning Stream
              </span>
            )}
            {currentPhase === 'live' && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 animate-pulse">
                <Radio className="w-3 h-3 text-rose-400" />
                Live Mode
              </span>
            )}
            {currentPhase === 'completed' && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-400" />
                Gratitude Circle (72h)
              </span>
            )}
          </div>
          {purposeStatement && (
            <p className="text-xs font-serif italic text-slate-300 line-clamp-1">
              "{purposeStatement}"
            </p>
          )}
        </div>

        {/* Host Megaphone Mode Toggle (Live Phase Only) */}
        {currentPhase === 'live' && isHost && (
          <button
            type="button"
            onClick={() => setIsMegaphoneActive(!isMegaphoneActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border min-h-[38px] ${
              isMegaphoneActive
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>{isMegaphoneActive ? 'Megaphone ON' : 'Megaphone'}</span>
          </button>
        )}
      </div>

      {/* 2. Mode Sub-banner */}
      {isMegaphoneActive && currentPhase === 'live' && (
        <div className="px-4 py-2 bg-amber-500/15 border-b border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Megaphone Active: Your next message will be highlighted as a priority host broadcast.</span>
        </div>
      )}

      {currentPhase === 'completed' && (
        <div className="px-4 py-2 bg-gradient-to-r from-amber-950/30 to-slate-900 border-b border-amber-500/20 text-xs text-amber-200/90 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>Share your favorite moments and thank-yous. This circle seals in 72 hours.</span>
        </div>
      )}

      {/* 3. Messages Stream */}
      <div 
        ref={chatContainerRef} 
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 overscroll-contain"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Sparkles className="w-8 h-8 mb-2 opacity-40 text-amber-400" />
            <p className="text-xs font-semibold text-slate-400">Quiet for now</p>
            <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
              {currentPhase === 'live'
                ? 'High-priority host announcements and quick check-in notes will appear here.'
                : 'Start the conversation before gathering.'}
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderName === currentUserName;

            if (m.isBroadcast) {
              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-rose-500/20 to-slate-900 border border-amber-500/40 text-white shadow-lg space-y-1 my-2"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                      Host Broadcast • {m.senderName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-100 leading-relaxed break-words [overflow-wrap:anywhere]">
                    {m.content}
                  </p>
                </div>
              );
            }

            return (
              <div
                key={m.id}
                className={`p-3 rounded-2xl max-w-[85%] space-y-1 text-xs transition-all ${
                  isMe
                    ? 'ml-auto bg-indigo-600/90 text-white shadow-md shadow-indigo-600/20'
                    : m.senderRole === 'host'
                    ? 'mr-auto bg-slate-900 border border-amber-500/30 text-slate-100'
                    : 'mr-auto bg-slate-900/80 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px]">
                  <span className="font-bold text-slate-300">
                    {m.senderName} {m.senderRole === 'host' ? '(Host)' : ''}
                  </span>
                  <span className="text-slate-400 text-[9px]">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="leading-relaxed break-words [overflow-wrap:anywhere]">{m.content}</p>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Compose Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2">
        <input
          type="text"
          maxLength={500}
          aria-label="Type a message or announcement"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isMegaphoneActive
              ? 'Send megaphone announcement to all guests...'
              : currentPhase === 'completed'
              ? 'Add a reflection or thank-you note...'
              : 'Type a message...'
          }
          className="flex-1 p-2.5 rounded-xl glass-input text-xs"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          aria-label={isMegaphoneActive ? 'Broadcast announcement' : 'Send message'}
          className={`p-2.5 rounded-xl transition-all disabled:opacity-40 min-h-[44px] min-w-[44px] flex items-center justify-center ${
            isMegaphoneActive
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
