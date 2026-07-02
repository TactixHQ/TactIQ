import { useState } from "react";
import { 
  Home, 
  LayoutGrid, 
  Zap, 
  Users, 
  Compass, 
  Sparkles, 
  User, 
  Menu, 
  X,
  Hexagon
} from "lucide-react";

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
    { id: "home", label: "Home", icon: Home, desc: "Match Brain + daily insights" },
    { id: "board", label: "Board", icon: LayoutGrid, desc: "Open tactics canvas" },
    { id: "simulator", label: "Simulator", icon: Zap, desc: "AI Match Simulator" },
    { id: "team", label: "Team", icon: Users, desc: "Your squad workspace" },
    { id: "explore", label: "Explore", icon: Compass, desc: "Community & challenges" },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR - Persistent Left Rail */}
      <aside 
        className={`hidden md:flex flex-col justify-between border-r border-gray-800 bg-gray-950/95 text-gray-400 h-screen transition-all duration-300 shrink-0 select-none ${
          expanded ? "w-64" : "w-16"
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between p-4 border-b border-gray-800 h-16">
            <div className="flex items-center gap-2.5 truncate">
              <div className="text-emerald-400 p-1 bg-emerald-950/50 rounded-lg border border-emerald-900/40">
                <Hexagon className="w-5 h-5 fill-emerald-400/10" />
              </div>
              {expanded && (
                <span className="font-display font-bold text-lg text-white tracking-tight">
                  TactIQ
                </span>
              )}
            </div>
            {expanded ? (
              <button 
                id="btn-collapse-sidebar"
                onClick={() => setExpanded(false)}
                className="p-1 hover:text-white rounded hover:bg-gray-900 cursor-pointer hidden xl:block"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button 
                id="btn-expand-sidebar"
                onClick={() => setExpanded(true)}
                className="p-1 hover:text-white rounded hover:bg-gray-900 mx-auto cursor-pointer hidden xl:block"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  id={`nav-item-${item.id}`}
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative cursor-pointer ${
                    isActive
                      ? "text-white bg-emerald-950/30 border-l-2 border-emerald-500 rounded-l-none pl-2.5"
                      : "hover:text-white hover:bg-gray-900"
                  }`}
                  title={!expanded ? item.label : ""}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-emerald-400" : "text-gray-400 group-hover:text-emerald-300"}`} />
                  {expanded && (
                    <div className="text-left leading-tight truncate">
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-[10px] text-gray-500 font-normal truncate max-w-[170px]">
                        {item.desc}
                      </div>
                    </div>
                  )}
                  
                  {/* Active Green dot collapsed indicator */}
                  {!expanded && isActive && (
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility Rail */}
        <div className="p-3 border-t border-gray-900 space-y-1 bg-gray-950/40">
          {/* Pro Upgrade Flag */}
          <button
            id="btn-sidebar-pro"
            onClick={onTogglePro}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative cursor-pointer ${
              isPro 
                ? "text-amber-400 bg-amber-950/20 hover:bg-amber-950/30 border border-amber-900/30" 
                : "text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/30 border border-emerald-900/30"
            }`}
          >
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
            {expanded && (
              <div className="text-left truncate">
                <div className="font-bold text-xs">
                  {isPro ? "Pro Plan Active" : "Upgrade to Pro"}
                </div>
                <div className="text-[10px] text-gray-400 font-normal">
                  {isPro ? "Unlimited AI + Exports" : "Unlock Simulation Hub"}
                </div>
              </div>
            )}
          </button>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-900 cursor-pointer">
            <User className="w-5 h-5 text-gray-400" />
            {expanded && (
              <div className="text-left leading-tight">
                <div className="font-semibold text-xs text-gray-200 truncate max-w-[120px]">
                  Coach Marcus
                </div>
                <div className="text-[10px] text-gray-500">grassroots@tactiq.ai</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MOBILE NAV - Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-gray-950 border-t border-gray-800 z-50 flex items-center justify-around px-2 text-gray-400 select-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              id={`mobile-nav-${item.id}`}
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-1 w-12 py-1 relative cursor-pointer ${
                isActive ? "text-emerald-400 font-medium" : "hover:text-gray-200"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
              {isActive && (
                <span className="absolute -top-1 w-5 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
        {/* Quick Pro toggler on mobile */}
        <button
          onClick={onTogglePro}
          className={`flex flex-col items-center justify-center gap-1 w-12 py-1 cursor-pointer ${
            isPro ? "text-amber-400" : "text-emerald-500"
          }`}
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="text-[10px]">{isPro ? "Pro" : "Free"}</span>
        </button>
      </div>
    </>
  );
}
