"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bot, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function RecommendationsClient({ userId, apiToken }: { userId: string; apiToken: string }) {
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"weak_points" | "recent_activity">("weak_points");

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const res = await fetch(`${API_URL}/users/${userId}/recommendations`, {
          headers: {
            'Authorization': `Bearer ${apiToken}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data);
        }
      } catch (err) {
        console.error("Failed to fetch recommendations", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-container-padding pb-20 fade-in pt-8">
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="h-10 w-64 bg-surface-container rounded animate-pulse mb-3"></div>
          <div className="h-4 w-96 bg-surface-container rounded animate-pulse"></div>
        </div>
        <div className="flex justify-center mb-12">
          <div className="bg-surface-container-low p-1.5 rounded-2xl flex shadow-sm border border-outline-variant/10 h-14 w-80 animate-pulse"></div>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-sm h-80 rounded-3xl bg-surface-container-low border border-outline-variant/20 shadow-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-container-padding pb-20 fade-in pt-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-display text-on-surface mb-2 tracking-tight">AI Recommendations</h1>
        <p className="text-on-surface-variant">Personalized problem sets tailored to your strengths and weaknesses.</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-12">
        <div className="bg-surface-container-low p-1.5 rounded-2xl flex shadow-sm border border-outline-variant/10">
          <button
            onClick={() => setActiveTab("weak_points")}
            className={`px-8 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "weak_points" 
                ? "bg-surface text-primary shadow-sm border border-outline-variant/10" 
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            Target Weak Points
          </button>
          <button
            onClick={() => setActiveTab("recent_activity")}
            className={`px-8 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "recent_activity" 
                ? "bg-surface text-primary shadow-sm border border-outline-variant/10" 
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            Recent Activity Momentum
          </button>
        </div>
      </div>

      {recommendations && (
        <div className="relative">
          {activeTab === "weak_points" && recommendations.weak_point && (
            <RecommendationCarousel 
              title="Target Your Weaknesses"
              subtitle={`You have solved very few problems in <span class="font-bold text-red-400 uppercase tracking-wide text-xs ml-1">${recommendations.weak_point.topic}</span>. Master these fundamentals:`}
              color="red"
              icon={<Bot className="w-5 h-5 text-red-400" />}
              problems={recommendations.weak_point.recommendations}
            />
          )}

          {activeTab === "recent_activity" && recommendations.progressive_mastery && (
            <RecommendationCarousel 
              title="Push Your Limits"
              subtitle={`You've been building momentum in <span class="font-bold text-blue-400 uppercase tracking-wide text-xs ml-1">${recommendations.progressive_mastery.topic}</span>. Try these <span class="text-on-surface font-bold">${recommendations.progressive_mastery.target_difficulty}</span> challenges next:`}
              color="blue"
              icon={<ArrowUpRight className="w-5 h-5 text-blue-400" />}
              problems={recommendations.progressive_mastery.recommendations}
            />
          )}
        </div>
      )}
    </div>
  );
}

function RecommendationCarousel({ title, subtitle, color, icon, problems: initialProblems }: { title: string, subtitle: string, color: string, icon: React.ReactNode, problems: any[] }) {
  const [problems, setProblems] = useState(initialProblems);
  const [activeIndex, setActiveIndex] = useState(0);

  // If initial problems update from backend, reset state
  useEffect(() => {
    setProblems(initialProblems);
    setActiveIndex(0);
  }, [initialProblems]);

  const nextCard = () => {
    setActiveIndex(i => (i + 1) % problems.length);
  };

  const prevCard = () => {
    setActiveIndex(i => (i - 1 + problems.length) % problems.length);
  };

  const markSolved = (index: number) => {
    // Remove the problem from the array
    const newProblems = [...problems];
    newProblems.splice(index, 1);
    setProblems(newProblems);
    
    // Adjust active index if we removed the last item
    if (activeIndex >= newProblems.length) {
      setActiveIndex(Math.max(0, newProblems.length - 1));
    }
  };

  if (problems.length === 0) {
    return (
      <div className="text-center p-16 bg-surface-container-low rounded-3xl border border-outline-variant/10 fade-in">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-display text-on-surface mb-2">All caught up here!</h3>
        <p className="text-on-surface-variant">Check back later for more recommendations.</p>
      </div>
    );
  }

  const borderColor = color === "red" ? "border-red-500/20" : "border-blue-500/20";
  const glowColor = color === "red" ? "shadow-[0_0_40px_-15px_rgba(239,68,68,0.2)]" : "shadow-[0_0_40px_-15px_rgba(59,130,246,0.2)]";

  return (
    <div className="flex flex-col items-center fade-in">
      <div className="text-center mb-10 max-w-lg">
        <h3 className="font-display text-2xl flex items-center justify-center gap-2 mb-3 text-on-surface">
          {icon}
          {title}
        </h3>
        <p className="text-on-surface-variant text-sm" dangerouslySetInnerHTML={{__html: subtitle}}></p>
      </div>

      <div className="relative w-full max-w-sm h-80 flex justify-center items-center">
        {/* Navigation Buttons */}
        <button 
          onClick={prevCard}
          disabled={problems.length <= 1}
          className="absolute -left-12 sm:-left-20 z-20 p-3 rounded-full bg-surface-container hover:bg-surface-container-high disabled:opacity-0 disabled:-translate-x-4 transition-all duration-300 border border-outline-variant/20 shadow-lg text-on-surface"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button 
          onClick={nextCard}
          disabled={problems.length <= 1}
          className="absolute -right-12 sm:-right-20 z-20 p-3 rounded-full bg-surface-container hover:bg-surface-container-high disabled:opacity-0 disabled:translate-x-4 transition-all duration-300 border border-outline-variant/20 shadow-lg text-on-surface"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Cards container */}
        <div className="relative w-full h-full flex justify-center items-center">
          {problems.map((p, i) => {
            let offset = i - activeIndex;
            const halfLen = problems.length / 2;
            
            // Wrap around logic for circular carousel
            if (problems.length > 2) {
              if (offset > halfLen) offset -= problems.length;
              else if (offset < -halfLen) offset += problems.length;
            }

            const isVisible = Math.abs(offset) <= 2; // Show active, and 2 neighbors
            
            if (!isVisible) return null;

            // Positioning logic for playcards
            const translateX = `${offset * 110}%`;
            const scale = 1 - Math.abs(offset) * 0.12;
            const zIndex = 10 - Math.abs(offset);
            const opacity = Math.abs(offset) === 0 ? 1 : Math.abs(offset) === 1 ? 0.3 : 0;
            const pointerEvents = offset === 0 ? "auto" : "none";

            const diffColors: Record<string, string> = {
              Easy: "text-green-400 bg-green-400/10",
              Medium: "text-yellow-400 bg-yellow-400/10",
              Hard: "text-red-400 bg-red-400/10",
            };
            const diffClass = diffColors[p.difficulty || "Medium"] || diffColors.Medium;

            return (
              <div 
                key={p.id || p.titleSlug}
                className={`absolute w-full h-full rounded-3xl bg-surface-container-low border ${borderColor} shadow-2xl ${offset === 0 ? glowColor : ''} flex flex-col justify-between p-7 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform`}
                style={{
                  transform: `translateX(${translateX}) scale(${scale})`,
                  zIndex,
                  opacity,
                  pointerEvents
                }}
              >
                <div>
                  <div className="flex justify-between items-start mb-5">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${diffClass}`}>
                      {p.difficulty || "Medium"}
                    </span>
                    <span className="text-xs text-on-surface-variant font-mono bg-surface-container px-2 py-1 rounded-md">#{i + 1} of {problems.length}</span>
                  </div>
                  <h4 className="text-2xl font-display font-medium text-on-surface line-clamp-3 leading-tight tracking-tight">
                    {p.title}
                  </h4>
                </div>

                <div className="flex flex-col gap-2.5">
                  <a 
                    href={p.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full py-3 bg-primary text-on-primary rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                  >
                    Solve on LeetCode
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                  
                  <div className="flex gap-2.5">
                    <Link
                      href={`/ai-mentor?problemId=${p.platform_problem_id || p.titleSlug || ''}`}
                      className="flex-1 py-3 bg-surface-container-high text-on-surface rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors text-sm border border-outline-variant/10 group"
                    >
                      <Bot className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      Ask Mentor
                    </Link>
                    
                    <button 
                      onClick={() => markSolved(i)}
                      className="flex-1 py-3 bg-surface-container-high text-on-surface rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors text-sm border border-outline-variant/10 group"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
                      Mark Solved
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
