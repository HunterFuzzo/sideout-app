import React, { useState } from 'react';
import { FollowedMatchesTab } from './screens/FollowedMatchesTab';
import { SearchTab } from './screens/SearchTab';
import { SettingsTab } from './screens/SettingsTab';
import { Home, Search, Settings } from 'lucide-react';

type TabKey = 'matches' | 'search' | 'settings';

interface TabItem {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { key: 'matches', label: 'Matchs', icon: Home },
  { key: 'search', label: 'Recherche', icon: Search },
  { key: 'settings', label: 'Paramètres', icon: Settings },
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('matches');
  const activeIndex = TABS.findIndex((t) => t.key === activeTab);

  const triggerHaptic = () => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(12);
      }
    } catch {}
  };

  const handleTabChange = (key: TabKey) => {
    if (key !== activeTab) {
      triggerHaptic();
      setActiveTab(key);
      try {
        window.scrollTo(0, 0);
      } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1c22] text-[#f4f5f8] flex flex-col max-w-md mx-auto relative select-none overflow-x-hidden">
      {/* Main Content Area with Safe Area Dynamic Island protection */}
      <main
        className="flex-1 pb-32 px-4 overflow-x-hidden"
        style={{ paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 14px), 58px)' }}
      >
        {activeTab === 'matches' && (
          <div key="matches" className="animate-in fade-in duration-200">
            <FollowedMatchesTab onNavigateToSearch={() => handleTabChange('search')} />
          </div>
        )}
        {activeTab === 'search' && (
          <div key="search" className="animate-in fade-in duration-200">
            <SearchTab />
          </div>
        )}
        {activeTab === 'settings' && (
          <div key="settings" className="animate-in fade-in duration-200">
            <SettingsTab />
          </div>
        )}
      </main>

      {/* Floating Capsule Nav Bar slightly lower */}
      <div
        className="fixed left-0 right-0 z-50 px-5 flex justify-center pointer-events-none max-w-md mx-auto"
        style={{ bottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 6px), 14px)' }}
      >
        <nav className="pointer-events-auto relative w-full max-w-xs sm:max-w-sm bg-[#252833]/95 backdrop-blur-2xl border border-[#343846] rounded-full p-1.5 shadow-[0_14px_35px_rgba(0,0,0,0.55)] flex items-center">
          {/* Sliding indicator pill */}
          <div
            className="absolute top-1.5 bottom-1.5 rounded-full bg-[#363a48] transition-transform duration-350 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-sm pointer-events-none"
            style={{
              left: '6px',
              width: 'calc((100% - 12px) / 3)',
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          />

          {/* Tabs */}
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`relative z-10 flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-full transition-colors duration-200 outline-none focus:outline-none focus:ring-0 select-none ${
                  isActive ? 'text-[#f4f5f8]' : 'text-[#8e93a4] hover:text-[#d4d4d8]'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className={`text-[11px] tracking-tight transition-all duration-200 ${isActive ? 'font-extrabold text-[#f4f5f8]' : 'font-semibold text-[#8e93a4]'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
