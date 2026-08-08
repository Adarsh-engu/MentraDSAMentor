"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2, Save, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type ProfileData = {
  name: string;
  email: string;
  college: string;
  dob: string;
  summary: string;
};

type Platform = {
  id: string;
  name: string;
};

export default function SettingsClient({ userId, apiToken }: { userId: string; apiToken: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    college: "",
    dob: "",
    summary: "",
  });

  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [handles, setHandles] = useState<Record<string, string>>({});
  const [authTokens, setAuthTokens] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, userPlatsRes, availPlatsRes] = await Promise.all([
          fetch(`${API_URL}/users/${userId}/profile`, { headers: { 'Authorization': `Bearer ${apiToken}` } }),
          fetch(`${API_URL}/users/${userId}/platforms`, { headers: { 'Authorization': `Bearer ${apiToken}` } }),
          fetch(`${API_URL}/platforms`, { headers: { 'Authorization': `Bearer ${apiToken}` } }),
        ]);

        if (profileRes.ok) {
          const p = await profileRes.json();
          setProfile({
            name: p.name || "",
            email: p.email || "",
            college: p.college || "",
            dob: p.dob ? p.dob.split("T")[0] : "",
            summary: p.summary || "",
          });
        }

        let availPlats: Platform[] = [];
        if (availPlatsRes.ok) {
          availPlats = await availPlatsRes.json();
          setPlatforms(availPlats);
        }

        if (userPlatsRes.ok) {
          const userPlats = await userPlatsRes.json();
          const initialHandles: Record<string, string> = {};
          const initialAuthTokens: Record<string, string> = {};
          userPlats.forEach((up: any) => {
            initialHandles[up.platform.name] = up.handle;
            if (up.auth_token) initialAuthTokens[up.platform.name] = up.auth_token;
          });
          setHandles(initialHandles);
          setAuthTokens(initialAuthTokens);
        }
      } catch (err) {
        console.error("Failed to load settings data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  const age = useMemo(() => {
    if (!profile.dob) return null;
    const birthDate = new Date(profile.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }, [profile.dob]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save profile
      await fetch(`${API_URL}/users/${userId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiToken}` },
        body: JSON.stringify({
          name: profile.name,
          college: profile.college,
          dob: profile.dob || null,
          summary: profile.summary,
        }),
      });

      // Save handles
      const supportedPlatforms = ["LeetCode", "Codeforces", "GeeksforGeeks", "Hive", "SmartInterviews"];
      for (const pName of supportedPlatforms) {
        const pInfo = platforms.find((p) => p.name === pName);
        if (pInfo && handles[pName]) {
          await fetch(`${API_URL}/users/${userId}/platforms`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiToken}` },
            body: JSON.stringify({
              platform_id: pInfo.id,
              handle: handles[pName],
              auth_token: authTokens[pName] || null,
            }),
          }).catch(() => {
            // Might already exist, ideally we need a PUT endpoint or handle conflicts gracefully
            console.warn(`Handle for ${pName} might already exist`);
          });
        }
      }
      
      toast.success("Profile saved successfully");
      router.push("/profile");
    } catch (err) {
      console.error("Failed to save", err);
      toast.error("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/users/${userId}/sync`, { 
        method: "POST",
        headers: { "Authorization": `Bearer ${apiToken}` }
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
      <div className="space-y-12 animate-pulse">
        <section className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 lg:p-8">
          <div className="h-6 w-48 bg-surface-container mb-6 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-10 bg-surface-container rounded"></div>
            <div className="h-10 bg-surface-container rounded"></div>
            <div className="h-24 md:col-span-2 bg-surface-container rounded"></div>
          </div>
        </section>
        
        <section className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 lg:p-8">
          <div className="h-6 w-48 bg-surface-container mb-6 rounded"></div>
          <div className="space-y-4">
            <div className="h-16 bg-surface-container rounded"></div>
            <div className="h-16 bg-surface-container rounded"></div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        
        <h2 className="text-xl font-headline-md text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-fixed">person</span>
          Bio Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div>
            <label className="block font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-2">Full Name</label>
            <input 
              type="text" 
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary-fixed-dim focus:ring-1 focus:ring-primary-fixed-dim/50 transition-all"
            />
          </div>
          <div>
            <label className="block font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              value={profile.email}
              disabled
              className="w-full bg-surface-container-highest/50 border border-outline-variant/20 rounded px-4 py-2.5 text-on-surface-variant cursor-not-allowed"
            />
            <p className="text-xs text-on-surface-variant/70 mt-1">Email cannot be changed.</p>
          </div>
          <div className="md:col-span-2">
            <label className="block font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-2">College / University</label>
            <input 
              type="text" 
              value={profile.college}
              onChange={(e) => setProfile({ ...profile, college: e.target.value })}
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary-fixed-dim focus:ring-1 focus:ring-primary-fixed-dim/50 transition-all"
            />
          </div>
          <div>
            <label className="block font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-2">Date of Birth</label>
            <input 
              type="date" 
              value={profile.dob}
              onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary-fixed-dim focus:ring-1 focus:ring-primary-fixed-dim/50 transition-all [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-2">Calculated Age</label>
            <div className="w-full bg-surface-container-high/50 border border-outline-variant/20 rounded px-4 py-2.5 text-primary font-bold">
              {age !== null ? `${age} years old` : "--"}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-2">Summary / Bio</label>
            <textarea 
              rows={4}
              value={profile.summary}
              onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded px-4 py-3 text-on-surface focus:outline-none focus:border-primary-fixed-dim focus:ring-1 focus:ring-primary-fixed-dim/50 transition-all resize-none"
              placeholder="Tell us a little about yourself, your coding journey, and your goals..."
            ></textarea>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-container/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        
        <h2 className="text-xl font-headline-md text-on-surface mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">code</span>
          Platform Handles
        </h2>
        <p className="text-on-surface-variant text-sm mb-6">Link your competitive programming and interview prep accounts.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {["LeetCode", "Codeforces", "GeeksforGeeks", "Hive", "SmartInterviews"].map(platform => (
            <div key={platform} className="space-y-4">
              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-2">{platform}</label>
                <div className="relative flex items-center bg-surface-container-high border border-outline-variant/30 rounded focus-within:border-primary-fixed-dim focus-within:ring-1 focus-within:ring-primary-fixed-dim/50 transition-all">
                  <div className="px-3 border-r border-outline-variant/30 text-on-surface-variant font-medium">@</div>
                  <input 
                    type="text"
                    value={handles[platform] || ""}
                    onChange={(e) => setHandles({ ...handles, [platform]: e.target.value })}
                    placeholder={`${platform} Handle`}
                    className="w-full bg-transparent px-3 py-2.5 text-on-surface outline-none"
                  />
                </div>
              </div>
              
              {platform === "LeetCode" && (
                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-2">Session Cookie (For Full Sync)</label>
                  <div className="relative flex items-center bg-surface-container-high border border-outline-variant/30 rounded focus-within:border-primary-fixed-dim focus-within:ring-1 focus-within:ring-primary-fixed-dim/50 transition-all">
                    <div className="px-3 border-r border-outline-variant/30 text-on-surface-variant font-medium whitespace-nowrap overflow-hidden">LEETCODE_SESSION</div>
                    <input 
                      type="password"
                      value={authTokens[platform] || ""}
                      onChange={(e) => setAuthTokens({ ...authTokens, [platform]: e.target.value })}
                      placeholder="Optional session cookie..."
                      className="w-full bg-transparent px-3 py-2.5 text-on-surface outline-none font-mono text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-between items-center bg-surface-container-low p-6 rounded-xl border border-outline-variant/20">
        <div>
          <h3 className="text-on-surface font-medium">Automatic Sync</h3>
          <p className="text-on-surface-variant text-sm">Pull your latest submissions from all linked platforms.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-medium py-3 px-6 rounded flex items-center gap-2 transition-all disabled:opacity-50 border border-outline-variant/30"
          >
            {syncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            {syncing ? "Syncing..." : "Sync Platforms"}
          </button>
          
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-primary to-secondary-container hover:scale-105 shadow-[0_0_15px_rgba(0,242,255,0.3)] text-on-primary-fixed font-bold py-3 px-8 rounded flex items-center gap-2 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
