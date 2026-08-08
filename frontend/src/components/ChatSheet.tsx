"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ChatSheet({ 
  problem, 
  isOpen, 
  onClose,
  userId
}: { 
  problem: any, 
  isOpen: boolean, 
  onClose: () => void,
  userId: string
}) {
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [similarProblems, setSimilarProblems] = useState<any[]>([]);

  const handleSend = async () => {
    if (!input.trim() || !problem) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8080/problems/${problem.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 400 && data.detail === "Groq API key not configured") {
          throw new Error("GROQ_API_KEY is not configured in your backend .env file. Please add it and restart the backend!");
        }
        throw new Error(data.detail || "Failed to connect to AI Mentor.");
      }
      
      if (data.similar_problems_used) {
        setSimilarProblems(data.similar_problems_used);
      }
      
      setMessages(prev => [...prev, { role: 'ai', content: data.response || "Something went wrong." }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'ai', content: `**Error:** ${err.message || "Failed to connect to AI Mentor."}` }]);
    } finally {
      setLoading(false);
    }
  };

  if (!problem) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl flex flex-col p-0 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl">
        <SheetHeader className="p-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-500" />
            AI Mentor
          </SheetTitle>
          <SheetDescription>
            Ask for hints or optimal approaches for <strong>{problem?.title}</strong>
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 pb-6">
            {messages.length === 0 && (
              <div className="text-center text-zinc-500 mt-10">
                <Lightbulb className="w-10 h-10 mx-auto mb-4 text-yellow-500 opacity-50" />
                <p>I'm here to help you understand this algorithm.</p>
                <p className="text-sm mt-2">Try asking: "What is the optimal time complexity?"</p>
              </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                  {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`rounded-xl px-4 py-3 max-w-[85%] text-sm ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200'
                }`}>
                  <div className="prose dark:prose-invert max-w-none text-sm">
                    <ReactMarkdown>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl px-4 py-3 text-sm text-zinc-500 animate-pulse">
                  Thinking...
                </div>
              </div>
            )}
          </div>
          
          {similarProblems.length > 0 && messages.length > 0 && (
            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg">
              <h4 className="text-xs font-bold text-yellow-800 dark:text-yellow-500 uppercase mb-2 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" /> Related Context Used
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                I noticed you've solved these mathematically similar problems before:
              </p>
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 list-disc pl-4 space-y-1">
                {similarProblems.map((sp, i) => (
                  <li key={i}>{sp.metadata.title} ({sp.metadata.difficulty})</li>
                ))}
              </ul>
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-full pr-2 pl-4 py-2 border border-zinc-200 dark:border-zinc-800 focus-within:ring-2 ring-indigo-500"
          >
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for a hint..."
              className="flex-1 bg-transparent border-none outline-none text-sm"
              disabled={loading}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-indigo-600 hover:bg-indigo-700 shrink-0"
              disabled={loading || !input.trim()}
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
