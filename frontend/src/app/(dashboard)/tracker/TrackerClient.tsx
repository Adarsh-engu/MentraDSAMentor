"use client";

import { useEffect, useState } from "react";
import { Loader2, ArrowUpRight, FolderTree, List as ListIcon, Bot, Filter, ChevronDown, ChevronUp, ArrowDownUp, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface SolvedProblem {
  id: string;
  title: string;
  difficulty: string;
  url: string;
  tags: string[];
  platform: string;
  submitted_at?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function TrackerClient({ userId, apiToken }: { userId: string; apiToken: string }) {
  const [problems, setProblems] = useState<SolvedProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupByTopic, setGroupByTopic] = useState(false);

  // Filters
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("None");

  useEffect(() => {
    async function fetchProblems() {
      try {
        const res = await fetch(`${API_URL}/users/${userId}/solved-problems`, {
          headers: {
            'Authorization': `Bearer ${apiToken}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setProblems(data);
        }
      } catch (err) {
        console.error("Failed to fetch solved problems", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProblems();
  }, [userId]);

  const [syncing, setSyncing] = useState(false);
  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/users/${userId}/sync`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${apiToken}`
        }
      });
      if (res.ok) {
        toast.success("Sync triggered! Your submissions are being pulled in the background.");
      } else {
        toast.error("Failed to start sync.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error triggering sync.");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-container-padding pb-20 fade-in pt-8">
        <div className="h-10 w-48 bg-surface-container mb-2 rounded animate-pulse"></div>
        <div className="h-4 w-96 bg-surface-container mb-8 rounded animate-pulse"></div>
        
        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 mb-8 h-16 animate-pulse"></div>

        <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden divide-y divide-outline-variant/10">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 lg:p-6">
              <div className="flex items-start gap-4 w-full">
                <div className="w-10 h-10 shrink-0 bg-surface-container rounded-md animate-pulse"></div>
                <div className="space-y-2 w-full max-w-md">
                   <div className="h-5 w-full bg-surface-container rounded animate-pulse"></div>
                   <div className="h-4 w-1/2 bg-surface-container rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-10 w-32 shrink-0 bg-surface-container rounded-full animate-pulse mt-4 md:mt-0"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Extract unique filter options
  const uniquePlatforms = Array.from(new Set(problems.map(p => p.platform))).sort();
  const allTags = new Set<string>();
  problems.forEach(p => {
    if (p.tags) p.tags.forEach(t => allTags.add(t));
  });
  const uniqueTopics = Array.from(allTags).sort((a, b) => a.localeCompare(b));

  // Apply filters
  const filteredProblems = problems.filter(p => {
    let diffMatch = true;
    if (difficultyFilter !== "All") {
      const isNumberDiff = !isNaN(Number(p.difficulty));
      if (isNumberDiff) {
        const num = Number(p.difficulty);
        if (difficultyFilter === "Easy") diffMatch = num < 1200;
        else if (difficultyFilter === "Medium") diffMatch = num >= 1200 && num < 1900;
        else if (difficultyFilter === "Hard") diffMatch = num >= 1900;
      } else {
        diffMatch = (p.difficulty || "Medium") === difficultyFilter;
      }
    }

    const platMatch = platformFilter === "All" || p.platform === platformFilter;

    let topicMatch = true;
    if (topicFilter !== "All") {
      if (topicFilter === "Uncategorized") {
        topicMatch = !p.tags || p.tags.length === 0;
      } else {
        topicMatch = p.tags && p.tags.some(t => t.toLowerCase() === topicFilter.toLowerCase());
      }
    }

    const searchMatch = searchQuery === "" || p.title.toLowerCase().includes(searchQuery.toLowerCase());

    return diffMatch && platMatch && topicMatch && searchMatch;
  });

  // Apply sorting
  const sortedProblems = [...filteredProblems].sort((a, b) => {
    if (sortBy === "Title (A-Z)") return a.title.localeCompare(b.title);
    if (sortBy === "Title (Z-A)") return b.title.localeCompare(a.title);
    
    if (sortBy.startsWith("Difficulty")) {
      const getDiffVal = (p: SolvedProblem) => {
        if (!isNaN(Number(p.difficulty))) {
          const num = Number(p.difficulty);
          if (num < 1200) return 1;
          if (num < 1900) return 2;
          return 3;
        }
        if (p.difficulty === "Easy") return 1;
        if (p.difficulty === "Medium") return 2;
        if (p.difficulty === "Hard") return 3;
        return 2;
      };
      
      const valA = getDiffVal(a);
      const valB = getDiffVal(b);
      
      if (sortBy === "Difficulty (Easy to Hard)") return valA - valB;
      if (sortBy === "Difficulty (Hard to Easy)") return valB - valA;
    }
    
    if (sortBy === "Latest to Old" || sortBy === "Old to Latest") {
      const timeA = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
      const timeB = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
      if (sortBy === "Latest to Old") return timeB - timeA;
      if (sortBy === "Old to Latest") return timeA - timeB;
    }
    
    return 0; // "None"
  });

  // Helper to render platform icon
  const renderPlatformIcon = (platform: string) => {
    if (platform === "LeetCode") {
      return <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png" alt="LeetCode" className="w-5 h-5 object-contain invert opacity-80" />;
    } else if (platform === "Codeforces") {
      return <img src="https://cdn.iconscout.com/icon/free/png-256/code-forces-3521352-2944796.png" alt="Codeforces" className="w-5 h-5 object-contain opacity-80" />;
    } else if (platform === "GeeksforGeeks") {
      return <img src="https://upload.wikimedia.org/wikipedia/commons/4/43/GeeksforGeeks.svg" alt="GeeksforGeeks" className="w-5 h-5 object-contain opacity-80" />;
    }
    return <span className="material-symbols-outlined text-on-surface-variant text-lg">code</span>;
  };

  // Organize data based on grouping
  let renderedContent;

  if (groupByTopic) {
    const grouped: Record<string, SolvedProblem[]> = {};
    sortedProblems.forEach(p => {
      if (!p.tags || p.tags.length === 0) {
        if (!grouped["Uncategorized"]) grouped["Uncategorized"] = [];
        grouped["Uncategorized"].push(p);
      } else {
        // Group by primary tag (first tag) to avoid duplicating problems in the list
        const primaryTag = p.tags[0];
        if (!grouped[primaryTag]) grouped[primaryTag] = [];
        grouped[primaryTag].push(p);
      }
    });

    const displayTopics = Object.keys(grouped).sort((a, b) => {
      if (a === "Uncategorized") return 1;
      if (b === "Uncategorized") return -1;
      return a.localeCompare(b);
    });

    renderedContent = (
      <div className="space-y-4">
        {displayTopics.length === 0 && (
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden p-8 text-center text-on-surface-variant">
            No questions match your filters.
          </div>
        )}
        {displayTopics.map(topic => (
          <TopicGroupAccordion 
            key={topic} 
            topic={topic} 
            problems={grouped[topic]} 
            renderPlatformIcon={renderPlatformIcon} 
          />
        ))}
      </div>
    );
  } else {
    // Flat list
    renderedContent = (
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden">
        <div className="divide-y divide-outline-variant/10">
          {sortedProblems.map(p => (
            <ProblemRow key={p.id} problem={p} renderPlatformIcon={renderPlatformIcon} />
          ))}
          {sortedProblems.length === 0 && problems.length > 0 && (
            <div className="p-8 text-center text-on-surface-variant">
              No questions match your filters.
            </div>
          )}
          {problems.length === 0 && (
            <div className="p-8 text-center text-on-surface-variant">
              No solved questions tracked yet. Sync your profiles on the dashboard!
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-container-padding pb-20 fade-in pt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display text-on-surface mb-2 tracking-tight">Solved Tracker</h1>
          <p className="text-on-surface-variant">A real-time log of every problem you've crushed across all platforms.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-surface-container p-1 rounded-lg border border-outline-variant/20">
          <button
            onClick={() => setGroupByTopic(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-medium text-sm ${!groupByTopic ? 'bg-primary-container text-on-primary-container shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <ListIcon className="w-4 h-4" />
            List View
          </button>
          <button
            onClick={() => setGroupByTopic(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-medium text-sm ${groupByTopic ? 'bg-primary-container text-on-primary-container shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <FolderTree className="w-4 h-4" />
            Group by Topic
          </button>
        </div>
        
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-lg font-medium border border-primary/20 disabled:opacity-50 h-10 w-full md:w-auto mt-2 md:mt-0"
        >
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {syncing ? "Syncing..." : "Refresh Sync"}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 mb-8 flex flex-wrap items-center gap-6 shadow-sm">
        <div className="flex items-center gap-2 text-on-surface-variant font-medium">
          <Filter className="w-4 h-4" />
          <span className="text-sm uppercase tracking-wider font-bold">Filters</span>
        </div>
        
        <div className="h-6 w-px bg-outline-variant/30 hidden md:block"></div>
        
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search problems..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-surface-container border border-outline-variant/20 rounded-md px-3 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-[150px] md:w-[200px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-on-surface-variant">Difficulty:</span>
            <select 
              value={difficultyFilter} 
              onChange={e => setDifficultyFilter(e.target.value)}
              className="bg-surface-container border border-outline-variant/20 rounded-md px-3 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer hover:bg-surface-container-high transition-colors appearance-none min-w-[100px]"
            >
              <option value="All">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-on-surface-variant">Platform:</span>
            <select 
              value={platformFilter} 
              onChange={e => setPlatformFilter(e.target.value)}
              className="bg-surface-container border border-outline-variant/20 rounded-md px-3 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer hover:bg-surface-container-high transition-colors appearance-none min-w-[120px]"
            >
              <option value="All">All Platforms</option>
              {uniquePlatforms.map(plat => (
                <option key={plat} value={plat}>{plat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-on-surface-variant">Topic:</span>
            <select 
              value={topicFilter} 
              onChange={e => setTopicFilter(e.target.value)}
              className="bg-surface-container border border-outline-variant/20 rounded-md px-3 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer hover:bg-surface-container-high transition-colors appearance-none max-w-[150px] md:max-w-[200px]"
            >
              <option value="All">All Topics</option>
              {uniqueTopics.map(t => (
                <option key={t} value={t}>{t.length > 25 ? t.substring(0, 25) + "..." : t}</option>
              ))}
              <option value="Uncategorized">Uncategorized</option>
            </select>
          </div>
          
          {!groupByTopic && (
            <>
              <div className="h-6 w-px bg-outline-variant/30 hidden lg:block mx-2"></div>
              
              <div className="flex items-center gap-2">
                <ArrowDownUp className="w-4 h-4 text-on-surface-variant" />
                <select 
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-surface-container border border-outline-variant/20 rounded-md px-3 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer hover:bg-surface-container-high transition-colors appearance-none min-w-[150px]"
                >
                  <option value="None">Sort: None</option>
                  <option value="Latest to Old">Latest to Old</option>
                  <option value="Old to Latest">Old to Latest</option>
                  <option value="Title (A-Z)">Title (A-Z)</option>
                  <option value="Title (Z-A)">Title (Z-A)</option>
                  <option value="Difficulty (Easy to Hard)">Difficulty (Easy to Hard)</option>
                  <option value="Difficulty (Hard to Easy)">Difficulty (Hard to Easy)</option>
                </select>
              </div>
            </>
          )}
          
          {(difficultyFilter !== "All" || platformFilter !== "All" || topicFilter !== "All" || searchQuery !== "" || (!groupByTopic && sortBy !== "None")) && (
            <button 
              onClick={() => {
                setDifficultyFilter("All");
                setPlatformFilter("All");
                setTopicFilter("All");
                setSearchQuery("");
                setSortBy("None");
              }}
              className="text-xs font-medium text-primary hover:text-primary-fixed-dim transition-colors ml-auto underline underline-offset-2"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {renderedContent}
    </div>
  );
}

function ProblemRow({ problem, renderPlatformIcon }: { problem: SolvedProblem, renderPlatformIcon: (p: string) => React.ReactNode }) {
  const diffColors: Record<string, string> = {
    Easy: "text-green-400 bg-green-400/10",
    Medium: "text-yellow-400 bg-yellow-400/10",
    Hard: "text-red-400 bg-red-400/10",
  };
  
  // Codeforces difficulties are usually numbers 800-3500
  const isNumberDiff = !isNaN(Number(problem.difficulty));
  const numDiff = Number(problem.difficulty);
  let colorClass = "text-on-surface-variant bg-surface-variant/20";
  if (isNumberDiff) {
    if (numDiff < 1200) colorClass = diffColors.Easy;
    else if (numDiff < 1900) colorClass = diffColors.Medium;
    else colorClass = diffColors.Hard;
  } else if (problem.difficulty && diffColors[problem.difficulty]) {
    colorClass = diffColors[problem.difficulty];
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 lg:p-6 hover:bg-surface-container-high/30 transition-colors">
      <div className="flex items-start gap-4 mb-3 md:mb-0">
        <div className="mt-1 p-2 bg-surface-container rounded-md border border-outline-variant/20">
          {renderPlatformIcon(problem.platform)}
        </div>
        <div>
          <a href={problem.url} target="_blank" rel="noreferrer" className="font-headline-md text-on-surface hover:text-primary transition-colors flex items-center gap-1">
            {problem.title}
            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${colorClass}`}>
              {problem.difficulty || "Unknown"}
            </span>
            {problem.tags && problem.tags.slice(0, 5).map((tag, i) => (
              <span key={i} className="text-[10px] font-medium text-on-surface-variant bg-surface-variant/10 border border-outline-variant/10 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
            {problem.tags && problem.tags.length > 5 && (
              <span className="text-[10px] text-on-surface-variant italic">+{problem.tags.length - 5} more</span>
            )}
          </div>
        </div>
      </div>
      <div>
        <Link 
          href={`/ai-mentor?problemId=${problem.id}`}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-fixed-dim/30 text-primary-fixed-dim hover:bg-primary hover:text-on-primary transition-all text-sm font-medium whitespace-nowrap"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden md:inline">Ask AI Mentor</span>
        </Link>
      </div>
    </div>
  );
}

function TopicGroupAccordion({ topic, problems, renderPlatformIcon }: { topic: string, problems: SolvedProblem[], renderPlatformIcon: (p: string) => React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden transition-all duration-200">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-surface-container hover:bg-surface-container-high transition-colors px-6 py-4 flex items-center justify-between focus:outline-none"
      >
        <h3 className="font-headline-md text-lg text-primary-fixed-dim flex items-center gap-2">
          {topic} 
          <span className="text-xs font-medium text-on-surface-variant bg-surface-variant/20 px-2 py-0.5 rounded-full">
            {problems.length} problems
          </span>
        </h3>
        <div className={`text-on-surface-variant transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      
      {isOpen && (
        <div className="divide-y divide-outline-variant/10 border-t border-outline-variant/10">
          {problems.map((p, idx) => (
            <ProblemRow key={`${p.id}-${idx}`} problem={p} renderPlatformIcon={renderPlatformIcon} />
          ))}
        </div>
      )}
    </div>
  );
}
