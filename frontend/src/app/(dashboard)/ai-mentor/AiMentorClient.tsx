"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Send, Sparkles, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  url: string;
  platform: string;
}

export default function AiMentorClient({ userId, apiToken }: { userId: string; apiToken: string }) {
  const searchParams = useSearchParams();
  const problemId = searchParams.get("problemId");
  
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (problemId) {
      // Setup initial context
      setMessages([
        { role: 'ai', content: `**SYSTEM ONLINE.** I am your cognitive algorithm mentor. Context bridge established for problem ID: \`${problemId}\`. How can I assist you with this problem?` }
      ]);
    } else {
      setMessages([
        { role: 'ai', content: "SYSTEM ONLINE. I am your cognitive algorithm mentor. To begin analysis, please initiate the Mentor Protocol directly from a problem in your Recent Executions table or Tracker on the Dashboard." }
      ]);
    }
  }, [problemId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    if (!problemId) {
      setMessages(prev => [...prev, { role: 'user', content: input }]);
      setInput("");
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: "Error: No active problem context detected. Please navigate to the Dashboard and click the robot icon next to a specific problem to establish a context bridge." 
        }]);
      }, 500);
      return;
    }

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // We will send the chat history to the backend
      const res = await fetch(`${API_URL}/problems/${problemId}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`
        },
        body: JSON.stringify({ 
          message: userMsg,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Failed to connect to AI Mentor.");
      }
      
      setMessages(prev => [...prev, { role: 'ai', content: data.response || "Something went wrong." }]);
    } catch (err: any) {
      toast.error(err.message || "Failed to connect to AI Mentor.");
      setMessages(prev => [...prev, { role: 'ai', content: `**Error:** ${err.message || "Failed to connect to AI Mentor."}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full p-container-padding gap-section-margin bg-transparent">
      {/* Header */}
      <div className="flex flex-col gap-2 shrink-0">
        <h1 className="font-display-lg text-[40px] text-on-surface flex items-center gap-3">
          <Bot className="w-10 h-10 text-primary-fixed-dim drop-shadow-[0_0_12px_rgba(0,242,255,0.4)]" />
          AI Mentor
        </h1>
        <p className="font-body-md text-on-surface-variant max-w-2xl">
          Ask our AI assistant for hints on algorithms you're struggling with. Powered by RAG & LLaMA-3.
        </p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-surface-container/30 border border-outline-variant/30 rounded-xl backdrop-blur-md overflow-hidden relative group">
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,242,255,0.02)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
        
        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 relative z-10">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded bg-surface-container-highest border flex items-center justify-center shrink-0 shadow-lg ${
                m.role === 'user' 
                  ? 'border-secondary-fixed/30 text-secondary-fixed shadow-[0_0_10px_rgba(195,192,255,0.2)]' 
                  : 'border-primary-fixed-dim/30 text-primary-fixed-dim shadow-[0_0_10px_rgba(0,242,255,0.2)]'
              }`}>
                {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`rounded-lg px-5 py-4 max-w-[80%] font-body-md text-[14px] leading-relaxed border backdrop-blur-md ${
                m.role === 'user' 
                  ? 'bg-secondary-container/10 border-secondary/20 text-on-surface' 
                  : 'bg-primary-container/10 border-primary-fixed-dim/20 text-primary'
              }`}>
                <div className="prose prose-invert max-w-none text-sm [&>p]:mb-2 [&>p:last-child]:mb-0 [&>pre]:bg-surface-container-highest [&>pre]:p-3 [&>pre]:rounded-md [&>code]:bg-surface-container-highest [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded">
                  <ReactMarkdown>
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex gap-4">
               <div className="w-10 h-10 rounded bg-surface-container-highest border border-primary-fixed-dim/30 text-primary-fixed-dim flex items-center justify-center shrink-0 shadow-lg shadow-[0_0_10px_rgba(0,242,255,0.2)]">
                 <Loader2 className="w-5 h-5 animate-spin" />
               </div>
               <div className="rounded-lg px-5 py-4 bg-primary-container/10 border border-primary-fixed-dim/20 text-primary backdrop-blur-md flex items-center">
                 <span className="animate-pulse">Synthesizing cognitive response...</span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest/50 shrink-0 relative z-10">
          <form 
            onSubmit={handleSend}
            className="flex items-center gap-2 bg-surface-container-highest/50 rounded pr-2 pl-4 py-2 border border-outline-variant/30 focus-within:border-primary-fixed-dim/50 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-primary-fixed-dim" />
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={problemId ? "Ask for a hint, time complexity, or approach..." : "Context required to ask questions..."}
              disabled={!problemId || loading}
              className="flex-1 bg-transparent border-none outline-none text-on-surface font-label-caps text-label-caps placeholder:text-outline-variant/50 disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={!input.trim() || !problemId || loading}
              className="h-10 px-6 rounded bg-primary-container/10 border border-primary-fixed-dim/40 text-primary-fixed-dim hover:bg-primary hover:text-on-primary font-label-caps text-label-caps transition-all disabled:opacity-50 flex items-center gap-2"
            >
              SEND
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
