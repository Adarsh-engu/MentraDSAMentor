"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

export function MentraLayout({ children, user }: { children: React.ReactNode, user?: any }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", path: "/profile", icon: "dashboard" },
    { name: "Tracker", path: "/tracker", icon: "track_changes" },
    { name: "Find Similar", path: "/find-similar", icon: "troubleshoot" },
    { name: "AI Mentor", path: "/ai-mentor", icon: "psychology" },
    { name: "Recommendations", path: "/recommendations", icon: "auto_awesome" },
    { name: "Analytics", path: "/analytics", icon: "query_stats" },
  ];

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-20 lg:w-64 bg-surface-container-low/40 backdrop-blur-2xl z-50 flex flex-col border-r border-outline-variant/20 transition-all duration-300 group">
        <div className="p-6 flex items-center gap-4 border-b border-outline-variant/10">
          <img
            alt="Mentra Logo"
            className="h-8 w-8 object-cover rounded shadow-[0_0_15px_rgba(0,242,255,0.3)]"
            src="/logo.jpg"
          />
          <span className="hidden lg:block font-headline-md text-headline-md text-primary-fixed-dim tracking-tight">
            MENTRA
          </span>
        </div>
        <nav className="flex-1 py-component-gap px-3 space-y-unit">
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-4 py-3 rounded transition-all duration-200 group/link ${
                  isActive
                    ? "bg-primary-container/10 text-primary shadow-[inset_0_0_12px_rgba(0,242,255,0.15)]"
                    : "text-on-surface-variant hover:bg-surface-container-high/50 hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined mr-0 lg:mr-4 text-2xl">
                  {item.icon}
                </span>
                <span className="hidden lg:block font-label-caps text-label-caps uppercase">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="p-6 border-t border-outline-variant/10">
          <Link href="/settings" className="flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined">settings</span>
            <span className="hidden lg:block font-label-caps text-label-caps uppercase">
              Settings
            </span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-20 lg:ml-64 transition-all duration-300">
        {/* Topbar */}
        <header className="fixed top-0 left-20 lg:left-64 right-0 h-16 bg-background/60 backdrop-blur-xl z-40 flex items-center justify-between px-container-padding border-b border-outline-variant/10">
          <div className="flex items-center gap-unit">
            {/* Removed SYSTEM ONLINE and Search bar to keep UI simple */}
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-l border-outline-variant/20 pl-6">
              <ThemeToggle />
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">
                notifications
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-fixed-dim to-secondary-container ring-2 ring-primary-fixed-dim/30 cursor-pointer shadow-[0_0_10px_rgba(0,219,231,0.3)] hover:scale-105 transition-transform overflow-hidden flex items-center justify-center">
                    {user?.image ? (
                      <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[12px] font-bold text-on-primary-fixed">{user?.name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                } />
                <DropdownMenuContent align="end" className="bg-surface border-outline-variant/20">
                  <DropdownMenuItem 
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-error focus:bg-error-container/20 focus:text-error cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="relative pt-16 min-h-screen bg-transparent">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
