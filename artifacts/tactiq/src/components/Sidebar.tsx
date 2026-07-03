import { useState } from "react";
import {
  Home,
  LayoutGrid,
  Zap,
  Users,
  Compass,
  Sparkles,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { LogoIcon } from "./Logo";

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isPro: boolean;
  onTogglePro: () => void;
}

export default function Sidebar({
  currentView,
  onNavigate,
  isPro,
  onTogglePro
}: SidebarProps) {
  const [expanded, setExpanded] = useState<boolean>(true);

  const navItems = [
    { id: "home",      label: "Home",      icon: Home,        desc: "Dashboard & AI insights" },
    { id: "board",     label: "Board",     icon: LayoutGrid,  desc: "Tactics canvas" },
    { id: "simulator", label: "Simulator", icon: Zap,         desc: "AI match simulator" },
    { id: "team",      label: "Team",      icon: Users,       desc: "Squad workspace" },
    { id: "explore",   label: "Explore",   icon: Compass,     desc: "Community tactics" },
  ];

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={`hidden md:flex flex-col justify-between border-r border-gray-800/80 bg-gray-950 h-screen transition-all duration-300 ease-in-out shrink-0 select-none ${
          expanded ? "w-60" : "w-[60px]"
        }`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div>
          <div className={`flex items-center h-14 border-b border-gray-800/80 px-3.5 ${expanded ? "justify-between" : "justify-center"}`}>
            <button
              onClick={() => onNavigate("home")}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer"
              aria-label="Go to home"
            >
              <div className="shrink-0 p-1 bg-emerald-950/60 rounded-lg border border-emerald-900/50">
                <LogoIcon className="w-5 h-5" />
              </div>
              {expanded && (
                <span className="font-display font-bold text-base text-white tracking-tight truncate">
                  TactIQ
                </span>
              )}
            </button>

            {expanded && (
              <button
                onClick={() => setExpanded(false)}
                className="p-1.5 rounded-md text-gray-600 hover:text-gray-300 hover:bg-gray-900 transition cursor-pointer"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Nav items */}
          <nav className="p-2 space-y-0.5 mt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  id={`nav-item-${item.id}`}
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={!expanded ? item.label : undefined}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all cursor-pointer group ${
                    expanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
                  } ${
                    isActive
                      ? "bg-emerald-950/40 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-900/80"
                  }`}
                >
                  <Icon
                    className={`shrink-0 transition-colors ${expanded ? "w-4 h-4" : "w-5 h-5"} ${
                      isActive ? "text-emerald-400" : "group-hover:text-emerald-300"
                    }`}
                  />
                  {expanded && (
                    <div className="text-left leading-tight truncate min-w-0">
                      <div className={`font-semibold text-sm ${isActive ? "text-white" : ""}`}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-gray-500 font-normal truncate">
                        {item.desc}
                      </div>
                    </div>
                  )}
                  {isActive && !expanded && (
                    <span className="sr-only">(active)</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom rail */}
        <div className="p-2 border-t border-gray-800/80 space-y-0.5 pb-3">
          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="w-full flex justify-center p-2.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-gray-900 transition cursor-pointer mb-1"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Pro badge */}
          <button
            id="btn-sidebar-pro"
            onClick={onTogglePro}
            title={!expanded ? (isPro ? "Pro Active" : "Upgrade to Pro") : undefined}
            className={`w-full flex items-center gap-3 rounded-lg text-sm font-medium transition cursor-pointer ${
              expanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
            } ${
              isPro
                ? "text-amber-400 bg-amber-950/25 hover:bg-amber-950/40 border border-amber-900/30"
                : "text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/35 border border-emerald-900/30"
            }`}
          >
            <Sparkles className={`shrink-0 ${expanded ? "w-4 h-4" : "w-5 h-5"} ${isPro ? "text-amber-400" : "text-emerald-400"}`} />
            {expanded && (
              <div className="text-left truncate">
                <div className="font-bold text-xs">{isPro ? "Pro Plan Active" : "Upgrade to Pro"}</div>
                <div className="text-[10px] text-gray-400 font-normal">
                  {isPro ? "Unlimited AI access" : "Unlock all features"}
                </div>
              </div>
            )}
          </button>

          {/* Profile */}
          <div
            className={`flex items-center gap-3 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-900/80 transition cursor-pointer ${
              expanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
            }`}
            title={!expanded ? "Profile" : undefined}
          >
            <div className={`shrink-0 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center ${expanded ? "w-6 h-6" : "w-7 h-7"}`}>
              <User className="w-3.5 h-3.5 text-gray-400" />
            </div>
            {expanded && (
              <div className="text-left leading-tight min-w-0">
                <div className="font-semibold text-xs text-gray-200 truncate">My Profile</div>
                <div className="text-[10px] text-gray-500">Coach account</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-gray-950/98 backdrop-blur-sm border-t border-gray-800/80 z-50 flex items-center justify-around px-1 select-none"
        aria-label="Mobile navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              id={`mobile-nav-${item.id}`}
              key={item.id}
              onClick={() => onNavigate(item.id)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 relative transition-colors cursor-pointer ${
                isActive ? "text-emerald-400" : "text-gray-500 active:text-gray-200"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-emerald-400 rounded-full" />
              )}
              <Icon className={`transition-transform ${isActive ? "w-5 h-5 scale-110" : "w-5 h-5"}`} />
              <span className={`text-[9px] font-medium ${isActive ? "text-emerald-400" : "text-gray-500"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
