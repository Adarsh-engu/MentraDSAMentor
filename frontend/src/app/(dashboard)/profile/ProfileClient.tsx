"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Activity, Code, CheckCircle, Clock, RefreshCw, Bot, Sparkles } from "lucide-react";
import { ActivityCalendar } from "react-activity-calendar";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ProfileClient({ userId, apiToken }: { userId: string; apiToken: string }) {
  const [stats, setStats] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeChatProblem, setActiveChatProblem] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [leetcodeHandle, setLeetcodeHandle] = useState("");
  const [leetcodeAuthToken, setLeetcodeAuthToken] = useState("");
  const [cfHandle, setCfHandle] = useState("");
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, subsRes, platsRes, heatmapRes] = await Promise.all([
          fetch(`${API_URL}/users/${userId}/dashboard-stats`, { headers: { 'Authorization': `Bearer ${apiToken}` } }),
          fetch(`${API_URL}/users/${userId}/submissions?size=10`, { headers: { 'Authorization': `Bearer ${apiToken}` } }),
          fetch(`${API_URL}/users/${userId}/platforms`, { headers: { 'Authorization': `Bearer ${apiToken}` } }),
          fetch(`${API_URL}/users/${userId}/heatmap`, { headers: { 'Authorization': `Bearer ${apiToken}` } })
        ]);

        if (platsRes.ok) {
          const plats = await platsRes.json();
          if (plats.length === 0) {
            setNeedsOnboarding(true);
            setLoading(false);
            return;
          }
        }

        if (statsRes.ok) setStats(await statsRes.json());
        if (subsRes.ok) {
          const subsData = await subsRes.json();
          setSubmissions(subsData.items);
        }
        if (heatmapRes.ok) {
          const hmData = await heatmapRes.json();
          setHeatmapData(hmData);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  const handleLinkPlatforms = async () => {
    if (!leetcodeHandle && !cfHandle) return;
    setLinking(true);
    try {
      const availRes = await fetch(`${API_URL}/platforms`, { headers: { 'Authorization': `Bearer ${apiToken}` } });
      const avail = await availRes.json();
      
      const lc = avail.find((p: any) => p.name === "LeetCode");
      const cf = avail.find((p: any) => p.name === "Codeforces");

      if (leetcodeHandle && lc) {
        await fetch(`${API_URL}/users/${userId}/platforms`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiToken}` },
          body: JSON.stringify({ platform_id: lc.id, handle: leetcodeHandle, auth_token: leetcodeAuthToken || null }),
        });
      }
      if (cfHandle && cf) {
        await fetch(`${API_URL}/users/${userId}/platforms`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiToken}` },
          body: JSON.stringify({ platform_id: cf.id, handle: cfHandle }),
        });
      }
      
      await fetch(`${API_URL}/users/${userId}/sync`, { method: "POST", headers: { 'Authorization': `Bearer ${apiToken}` } });
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error("Linking failed", err);
      setLinking(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch(`${API_URL}/users/${userId}/sync`, { method: "POST", headers: { 'Authorization': `Bearer ${apiToken}` } });
      setTimeout(() => window.location.reload(), 3000);
    } catch (err) {
      console.error("Failed to trigger sync", err);
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <span className="w-4 h-4 rounded-full bg-primary-fixed-dim animate-ping shadow-[0_0_20px_rgba(0,242,255,0.8)]"></span>
        <span className="font-label-caps text-label-caps text-primary-fixed-dim tracking-widest uppercase animate-pulse">Loading Dashboard...</span>
      </div>
    );
  }

  if (needsOnboarding) {
    return (
      <div className="fixed inset-0 z-[100] bg-surface flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none mix-blend-screen" />
        
        <div className="relative z-10 w-full max-w-lg bg-surface-container/60 backdrop-blur-[20px] border border-outline-variant/30 p-8 rounded-xl shadow-[0_0_50px_rgba(0,242,255,0.05)] flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="font-display-lg text-[32px] text-on-surface">Link Your Accounts</h1>
            <p className="font-body-md text-on-surface-variant text-sm">
              Link your LeetCode or Codeforces accounts to see your stats.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-[10px] text-primary-fixed-dim tracking-widest uppercase">
                LeetCode Identity
              </label>
              <input
                type="text"
                placeholder="e.g. neal_wu"
                value={leetcodeHandle}
                onChange={(e) => setLeetcodeHandle(e.target.value)}
                className="w-full bg-surface-container-highest/50 border border-outline-variant/50 rounded px-4 py-3 font-data-sm text-on-surface focus:outline-none focus:border-primary-fixed-dim/50 focus:ring-1 focus:ring-primary-fixed-dim/50 transition-all placeholder:text-outline-variant"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-[10px] text-primary-fixed-dim tracking-widest uppercase flex items-center gap-2">
                LeetCode Session Token
                <span className="px-1.5 py-0.5 rounded-sm bg-surface-container-highest border border-outline-variant/30 text-[8px]">OPTIONAL</span>
              </label>
              <input
                type="password"
                placeholder="LEETCODE_SESSION cookie"
                value={leetcodeAuthToken}
                onChange={(e) => setLeetcodeAuthToken(e.target.value)}
                className="w-full bg-surface-container-highest/50 border border-outline-variant/50 rounded px-4 py-3 font-data-sm text-on-surface focus:outline-none focus:border-primary-fixed-dim/50 focus:ring-1 focus:ring-primary-fixed-dim/50 transition-all placeholder:text-outline-variant"
              />
              <p className="font-body-md text-[11px] text-on-surface-variant">
                Required for complete historical retrieval &gt;20 submissions.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-[10px] text-secondary-fixed tracking-widest uppercase">
                Codeforces Identity
              </label>
              <input
                type="text"
                placeholder="e.g. tourist"
                value={cfHandle}
                onChange={(e) => setCfHandle(e.target.value)}
                className="w-full bg-surface-container-highest/50 border border-outline-variant/50 rounded px-4 py-3 font-data-sm text-on-surface focus:outline-none focus:border-secondary-fixed/50 focus:ring-1 focus:ring-secondary-fixed/50 transition-all placeholder:text-outline-variant"
              />
            </div>
          </div>

          <button
            onClick={handleLinkPlatforms}
            disabled={linking || (!leetcodeHandle && !cfHandle)}
            className="w-full py-4 rounded bg-primary-container/10 border border-primary-fixed-dim/40 text-primary-fixed-dim font-label-caps text-label-caps hover:bg-primary hover:text-on-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[inset_0_0_15px_rgba(0,242,255,0.1)] flex items-center justify-center gap-2"
          >
            {linking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {linking ? "LINKING ACCOUNTS..." : "LINK ACCOUNTS"}
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-20 text-error font-data-sm uppercase tracking-widest">System Error: Stats unreachable.</div>;
  }

  const pieData = stats.total_submissions > 0 ? [
    { name: "Accepted", value: stats.total_accepted, color: "#00dbe7" },
    { name: "Failed", value: Math.max(0, stats.total_submissions - stats.total_accepted), color: "#ffb4ab" }
  ] : [];

  return (
    <div className="flex flex-col w-full p-container-padding gap-section-margin bg-transparent">
      {/* Header & Sync */}
      <div className="flex items-center justify-between">
        <h1 className="font-display-lg text-[40px] text-on-surface">Dashboard</h1>
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-surface-container-highest border border-outline-variant/30 text-on-surface-variant hover:text-primary-fixed-dim hover:border-primary-fixed-dim/50 transition-all font-label-caps text-label-caps disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin text-primary-fixed-dim' : ''}`} />
          {syncing ? "SYNCING..." : "SYNC DATA"}
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-component-gap">
        <div className="bg-surface-container/50 border border-outline-variant/30 rounded-xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-primary-fixed-dim/50 transition-colors duration-300 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Total Submissions</span>
            <Code className="h-4 w-4 text-primary-fixed-dim" />
          </div>
          <span className="font-display-lg text-[32px] text-on-surface">{stats.total_submissions}</span>
        </div>

        <div className="bg-surface-container/50 border border-outline-variant/30 rounded-xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-primary-fixed-dim/50 transition-colors duration-300 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Total Accepted</span>
            <CheckCircle className="h-4 w-4 text-secondary-fixed" />
          </div>
          <span className="font-display-lg text-[32px] text-secondary-fixed">{stats.total_accepted}</span>
        </div>

        <div className="bg-surface-container/50 border border-outline-variant/30 rounded-xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-primary-fixed-dim/50 transition-colors duration-300 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Acceptance Rate</span>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display-lg text-[32px] text-primary">
            {stats.total_submissions > 0 ? Math.round((stats.total_accepted / stats.total_submissions) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-component-gap">
        <div className="md:col-span-2 bg-surface-container/50 border border-outline-variant/30 rounded-xl p-6 backdrop-blur-xl">
          <h2 className="font-headline-md text-data-lg text-on-surface mb-2 uppercase tracking-wider">Platform Distribution</h2>
          <p className="font-data-sm text-[11px] text-on-surface-variant mb-6">Number of submissions per platform.</p>
          <div className="h-[250px] w-full flex items-center justify-center">
            {stats.platform_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.platform_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                    stroke="none"
                  >
                    {stats.platform_distribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={["#00dbe7", "#c3c0ff", "#ffb4ab"][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111318', border: '1px solid #3a494b', borderRadius: '4px' }}
                    itemStyle={{ color: '#e2e2e8', fontSize: '12px', fontFamily: 'monospace' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '1px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="font-data-sm text-on-surface-variant text-[10px] tracking-widest uppercase">No data yet</span>
            )}
          </div>
        </div>

        <div className="bg-surface-container/50 border border-outline-variant/30 rounded-xl p-6 backdrop-blur-xl">
          <h2 className="font-headline-md text-data-lg text-on-surface mb-2 uppercase tracking-wider">Success Rate</h2>
          <p className="font-data-sm text-[11px] text-on-surface-variant mb-6">Accepted vs Failed attempts.</p>
          <div className="h-[250px] w-full flex items-center justify-center">
            {stats.total_submissions > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={90}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111318', border: '1px solid #3a494b', borderRadius: '4px' }}
                    itemStyle={{ color: '#e2e2e8', fontSize: '12px', fontFamily: 'monospace' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '1px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="font-data-sm text-on-surface-variant text-[10px] tracking-widest uppercase">No data yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      {heatmapData.length > 0 && (
        <div className="bg-surface-container/50 border border-outline-variant/30 rounded-xl p-6 backdrop-blur-xl relative overflow-hidden">
          <h2 className="font-headline-md text-data-lg text-on-surface mb-2 uppercase tracking-wider">Activity Heatmap</h2>
          <p className="font-data-sm text-[11px] text-on-surface-variant mb-6">Your combined submission history across all platforms over the past year.</p>
          <div className="flex justify-center w-full overflow-x-auto py-2">
            <ActivityCalendar 
              data={heatmapData} 
              theme={{
                dark: ['#1e293b', '#003d4d', '#008b9c', '#00c3d9', '#00f2ff']
              }}
              colorScheme="dark"
              hideTotalCount={false}
              hideColorLegend={false}
              blockMargin={4}
              blockRadius={2}
              blockSize={12}
              renderBlock={(block, activity) => {
                return React.cloneElement(block as React.ReactElement, {
                  children: <title>{activity.count} problems solved on {activity.date}</title>
                })
              }}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-container/50 border border-outline-variant/30 rounded-xl p-6 backdrop-blur-xl overflow-x-auto">
        <h2 className="font-headline-md text-data-lg text-on-surface mb-2 uppercase tracking-wider">Recent Submissions</h2>
        <p className="font-data-sm text-[11px] text-on-surface-variant mb-6">Your most recent problem submissions.</p>
        
        <table className="w-full text-left font-body-md text-[14px]">
          <thead>
            <tr className="border-b border-outline-variant/20 font-label-caps text-label-caps text-on-surface-variant tracking-widest">
              <th className="pb-4 font-normal">PROBLEM</th>
              <th className="pb-4 font-normal">STATUS</th>
              <th className="pb-4 font-normal">LANGUAGE</th>
              <th className="pb-4 font-normal">EXEC. TIME</th>
              <th className="pb-4 font-normal">TIMESTAMP</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <tr key={sub.id} className="border-b border-outline-variant/10 hover:bg-surface-container-highest/20 transition-colors group">
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <a href={sub.problem.url} target="_blank" rel="noreferrer" className="text-secondary-fixed hover:text-primary-fixed-dim transition-colors group-hover:underline font-data-sm text-[13px]">
                      {sub.problem.title}
                    </a>
                    <Link 
                      href={`/ai-mentor?problemId=${sub.problem.id}`}
                      className="p-1 rounded-sm bg-primary-container/10 border border-primary-fixed-dim/20 text-primary-fixed-dim hover:bg-primary-fixed-dim hover:text-on-primary transition-all opacity-0 group-hover:opacity-100"
                      title="ASK AI MENTOR"
                    >
                      <Bot className="w-3 h-3" />
                    </Link>
                  </div>
                </td>
                <td className="py-4">
                  <span className={`px-2 py-0.5 rounded-sm font-label-caps text-[10px] ${
                    sub.status.toLowerCase() === "accepted" || sub.status.toLowerCase() === "ok" 
                      ? "bg-primary-container/20 text-primary-fixed-dim border border-primary-fixed-dim/20" 
                      : "bg-error-container/20 text-error border border-error/20"
                  }`}>
                    {sub.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-4 text-on-surface-variant font-data-sm text-[12px] uppercase">{sub.language || "N/A"}</td>
                <td className="py-4 font-data-sm text-[12px] text-on-surface">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-outline-variant" />
                    {sub.runtime_ms ? `${sub.runtime_ms} ms` : "--"}
                  </div>
                </td>
                <td className="py-4 text-on-surface-variant font-data-sm text-[11px]">
                  {new Date(sub.submitted_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-on-surface-variant font-data-sm text-[11px] tracking-widest uppercase">
                  No execution records detected.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
