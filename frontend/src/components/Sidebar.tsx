import Link from "next/link";
import { LayoutDashboard, Code2, Settings, BrainCircuit } from "lucide-react";

export function Sidebar() {
  return (
    <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111111] flex flex-col h-full hidden md:flex">
      <div className="p-6">
        <div className="flex items-center gap-2 text-xl font-bold">
          <BrainCircuit className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>Algo Mentor</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition-colors">
          <LayoutDashboard className="w-4 h-4" />
          Profile
        </Link>
        <Link href="/tracker" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition-colors">
          <Code2 className="w-4 h-4" />
          Tracker
        </Link>
      </nav>
      
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
        AI-Powered DSA Tracker
      </div>
    </div>
  );
}
