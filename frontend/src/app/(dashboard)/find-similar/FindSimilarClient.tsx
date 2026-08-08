"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, ArrowUpRight, CheckCircle2, Sparkles, AlertCircle, Bot } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function FindSimilarClient({ userId, apiToken }: { userId: string; apiToken: string }) {
  const [solvedProblems, setSolvedProblems] = useState<any[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProblem, setSelectedProblem] = useState<any | null>(null);
  
  const [similarProblems, setSimilarProblems] = useState<any[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/users/${userId}/solved-problems`, {
      headers: { 'Authorization': `Bearer ${apiToken}` }
    })
      .then(res => res.json())
      .then(data => {
        setSolvedProblems(data || []);
      })
      .catch(err => {
        console.error("Error fetching solved problems:", err);
        toast.error("Failed to fetch your solved problems.");
      })
      .finally(() => setLoadingProblems(false));
  }, [userId, apiToken]);

  useEffect(() => {
    if (!selectedProblem) {
      setSimilarProblems([]);
      return;
    }

    setLoadingSimilar(true);
    fetch(`${API_URL}/problems/${selectedProblem.id}/similar?n=6`, {
      headers: { 'Authorization': `Bearer ${apiToken}` }
    })
      .then(res => res.json())
      .then(data => {
        setSimilarProblems(data.similar_problems || []);
      })
      .catch(err => {
        console.error("Error fetching similar problems:", err);
        toast.error("Failed to find similar problems.");
      })
      .finally(() => setLoadingSimilar(false));
  }, [selectedProblem, apiToken]);

  const filteredProblems = solvedProblems.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Column: Problem Selector */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6 h-full min-h-[500px] flex flex-col">
          <h2 className="text-xl font-headline-md font-bold text-on-surface mb-4">Your Solved Problems</h2>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search your history..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2 pb-4 max-h-[600px]">
            {loadingProblems ? (
              <div className="space-y-2 py-2">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="w-full h-16 rounded-xl bg-surface-container animate-pulse"></div>
                ))}
              </div>
            ) : filteredProblems.length === 0 ? (
              <div className="text-center py-10 text-on-surface-variant text-sm">
                No solved problems found. Go solve some first!
              </div>
            ) : (
              filteredProblems.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProblem(p)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex flex-col gap-1 ${
                    selectedProblem?.id === p.id 
                      ? "bg-primary-container/20 border-primary shadow-[0_0_15px_rgba(0,242,255,0.1)]" 
                      : "bg-surface-container border-outline-variant/10 hover:border-outline-variant/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-on-surface truncate">{p.title}</span>
                    {selectedProblem?.id === p.id && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                  </div>
                  <div className="flex gap-2 items-center text-[10px] uppercase font-bold tracking-wider">
                    <span className={p.difficulty === 'Easy' ? 'text-green-400' : p.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'}>
                      {p.difficulty}
                    </span>
                    <span className="text-on-surface-variant">• {p.platform}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Similar Problems Results */}
      <div className="w-full lg:w-2/3 flex flex-col">
        {!selectedProblem ? (
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
            <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6 border border-outline-variant/10">
              <Sparkles className="w-10 h-10 text-primary-fixed-dim" />
            </div>
            <h3 className="text-2xl font-headline-md font-bold mb-2">Select a Problem</h3>
            <p className="text-on-surface-variant max-w-md">
              Choose a problem from your history on the left, and the AI will analyze its semantic embedding to find identical algorithmic patterns for you to practice.
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-headline-md font-bold text-on-surface flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Similar Patterns Found
                </h3>
                <p className="text-on-surface-variant text-sm mt-1">
                  Showing matches conceptually similar to <span className="text-primary font-medium">{selectedProblem.title}</span>
                </p>
              </div>
            </div>

            {loadingSimilar ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 h-40 animate-pulse"></div>
                ))}
              </div>
            ) : similarProblems.length === 0 ? (
              <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl flex-1 flex flex-col items-center justify-center p-12">
                <AlertCircle className="w-10 h-10 text-on-surface-variant mb-4" />
                <p className="text-on-surface font-medium">No highly similar problems found.</p>
                <p className="text-on-surface-variant text-sm mt-1">This problem might be highly unique in our dataset.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {similarProblems.map((sim, idx) => (
                  <div key={idx} className="bg-surface-container-low border border-outline-variant/20 hover:border-primary/50 transition-all duration-300 rounded-2xl p-5 group flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          sim.metadata?.difficulty === 'Easy' ? 'bg-green-400/10 text-green-400' :
                          sim.metadata?.difficulty === 'Medium' ? 'bg-yellow-400/10 text-yellow-400' :
                          'bg-red-400/10 text-red-400'
                        }`}>
                          {sim.metadata?.difficulty || "Unknown"}
                        </span>
                        <span className="text-xs text-on-surface-variant bg-surface-variant/20 px-2 py-0.5 rounded font-medium">
                          {sim.metadata?.platform_name || "LeetCode"}
                        </span>
                      </div>
                      
                      <div className="bg-primary-container/20 text-primary text-xs font-bold px-2 py-1 rounded border border-primary/20 shrink-0">
                        {((1 - sim.distance) * 100).toFixed(1)}% Match
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-headline-md font-medium text-on-surface mb-2">{sim.metadata?.title}</h4>
                    
                    <div className="mt-auto pt-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-t border-outline-variant/10">
                      <a 
                        href={sim.metadata?.url || "#"} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-sm font-medium text-primary hover:text-primary-fixed-dim flex items-center gap-1 hover:underline underline-offset-4"
                      >
                        Solve on Platform
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                      
                      <Link
                        href={`/ai-mentor?problemId=${sim.id}`}
                        className="text-sm font-medium text-on-surface-variant hover:text-primary flex items-center gap-1 hover:underline underline-offset-4 transition-colors w-fit"
                      >
                        <Bot className="w-4 h-4" />
                        AI Mentor
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
