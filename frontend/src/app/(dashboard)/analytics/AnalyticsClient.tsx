"use client";

import { useEffect, useState } from "react";
import { Activity, Target, Brain, Flame, CheckCircle2, Trophy } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function AnalyticsClient({ userId, apiToken }: { userId: string; apiToken: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`${API_URL}/users/${userId}/analytics`, {
          headers: { 'Authorization': `Bearer ${apiToken}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [userId]);

  if (loading || !data) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] w-full p-container-padding gap-section-margin bg-transparent animate-pulse">
        <div className="h-12 w-48 bg-surface-container rounded-md mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-component-gap">
          <div className="lg:col-span-2 h-[450px] bg-surface-container/50 rounded-xl"></div>
          <div className="flex flex-col gap-component-gap">
            <div className="flex-1 bg-surface-container/50 rounded-xl h-[140px]"></div>
            <div className="flex-1 bg-surface-container/50 rounded-xl h-[140px]"></div>
            <div className="flex-1 bg-surface-container/50 rounded-xl h-[140px]"></div>
          </div>
        </div>
        <div className="h-[300px] bg-surface-container/50 rounded-xl mt-6"></div>
      </div>
    );
  }

  // Calculate difficulty percentage
  const totalDifficulties = data.difficulty_distribution.Easy + data.difficulty_distribution.Medium + data.difficulty_distribution.Hard;
  const hardPercent = totalDifficulties ? Math.round((data.difficulty_distribution.Hard / totalDifficulties) * 100) : 0;

  const renderPolarAngleAxis = (props: any) => {
    const { payload, x, y, cx, cy, ...rest } = props;
    
    // Adjust y position slightly to prevent text clipping
    const yOffset = y > cy ? 10 : -10;
    
    return (
      <text {...rest} x={x} y={y + yOffset} textAnchor="middle" fill="#a1a1aa" fontSize={12} fontWeight={500}>
        {payload.value}
      </text>
    );
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] w-full p-container-padding gap-section-margin bg-transparent pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-[40px] text-on-surface tracking-tight">Analytics</h1>
          <p className="text-on-surface-variant font-medium mt-1">Real-time metrics on your algorithmic proficiency.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary-container/20 border border-primary-fixed-dim/30 w-fit">
          <Activity className="w-4 h-4 text-primary-fixed-dim animate-pulse" />
          <span className="font-label-caps text-[10px] text-primary-fixed-dim tracking-widest font-bold">LIVE TRACKING</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-component-gap">
        
        {/* Main Radar */}
        <div className="lg:col-span-2 bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-sm hover:border-primary/20 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-display font-medium text-on-surface tracking-tight">Skill Progress</h2>
              <p className="text-sm text-on-surface-variant mt-1">Your proficiency across core data structures.</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="w-5 h-5 text-primary" />
            </div>
          </div>
          
          <div className="h-[350px] w-full relative mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data.radar_data}>
                <defs>
                  <linearGradient id="colorRadar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00dbe7" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#00dbe7" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <PolarGrid stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={renderPolarAngleAxis} />
                <PolarRadiusAxis angle={30} domain={[-20, 'auto']} tick={false} axisLine={false} />
                <Radar 
                  name="Mastery" 
                  dataKey="A" 
                  stroke="#00dbe7" 
                  strokeWidth={3} 
                  fill="url(#colorRadar)" 
                  fillOpacity={1} 
                  activeDot={{ r: 6, fill: '#18181b', stroke: '#00dbe7', strokeWidth: 2 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#00dbe7', fontSize: '14px', fontWeight: 600 }}
                  labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Stats */}
        <div className="flex flex-col gap-component-gap">
          <div className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6 flex flex-col gap-4 group hover:border-[#f97316]/40 transition-colors shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-on-surface-variant uppercase tracking-widest">Active Streak</span>
              <div className="p-2 bg-[#f97316]/10 rounded-lg group-hover:scale-110 transition-transform">
                <Flame className="w-4 h-4 text-[#f97316]" />
              </div>
            </div>
            <div className="mt-auto">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-medium text-[#f97316]">{data.current_streak}</span>
                <span className="text-on-surface-variant font-medium">days</span>
              </div>
              <p className="text-sm text-on-surface-variant mt-3 font-medium">Keep the momentum going!</p>
            </div>
          </div>

          <div className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6 flex flex-col gap-4 group hover:border-green-400/40 transition-colors shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-on-surface-variant uppercase tracking-widest">Problems Mastered</span>
              <div className="p-2 bg-green-400/10 rounded-lg group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
            </div>
            <div className="mt-auto">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-medium text-green-400">{data.total_unique_problems}</span>
                <span className="text-on-surface-variant font-medium">unique</span>
              </div>
              <p className="text-sm text-on-surface-variant mt-3 font-medium">Across all platforms.</p>
            </div>
          </div>
          <div className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6 flex flex-col gap-4 group hover:border-yellow-400/40 transition-colors shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-on-surface-variant uppercase tracking-widest">Mastery Score</span>
              <div className="p-2 bg-yellow-400/10 rounded-lg group-hover:scale-110 transition-transform">
                <Trophy className="w-4 h-4 text-yellow-400" />
              </div>
            </div>
            <div className="mt-auto">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-medium text-yellow-400">{data.mastery_score.toLocaleString()}</span>
                <span className="text-on-surface-variant font-medium">XP</span>
              </div>
              <p className="text-sm text-on-surface-variant mt-3 font-medium">Earned by solving & consistency.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Line Chart row */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6 md:p-8 flex flex-col gap-6 mt-6 shadow-sm hover:border-[#a855f7]/40 transition-colors group">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-display font-medium text-on-surface tracking-tight">7-Day Activity</h2>
            <p className="text-sm text-on-surface-variant mt-1">Daily accepted submissions over the last week.</p>
          </div>
          <div className="p-2 bg-[#a855f7]/10 rounded-lg group-hover:scale-110 transition-transform">
            <Brain className="w-5 h-5 text-[#a855f7]" />
          </div>
        </div>

        <div className="h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.line_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="time" 
                stroke="rgba(255,255,255,0.2)" 
                tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                tickMargin={12}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#a855f7', fontSize: '14px', fontWeight: 600 }}
                labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Line 
                type="monotone" 
                name="Submissions"
                dataKey="load" 
                stroke="#a855f7" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6, fill: '#a855f7', stroke: '#18181b', strokeWidth: 2 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
