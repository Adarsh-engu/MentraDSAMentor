import { ThemeToggle } from "./ThemeToggle";
import { Bell, Search } from "lucide-react";

export function Topbar() {
  return (
    <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111111] flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <span className="text-zinc-400 dark:text-zinc-600">Overview</span>
        </div>
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-md px-3 py-1.5 w-64 border border-zinc-200 dark:border-zinc-700">
          <Search className="w-4 h-4 text-zinc-500 mr-2" />
          <input 
            type="text" 
            placeholder="Search problems..." 
            className="bg-transparent border-none outline-none text-sm w-full text-zinc-700 dark:text-zinc-300"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300">
          <Bell className="w-5 h-5" />
        </button>
        <ThemeToggle />
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 ring-2 ring-zinc-200 dark:ring-zinc-800 cursor-pointer"></div>
      </div>
    </div>
  );
}
