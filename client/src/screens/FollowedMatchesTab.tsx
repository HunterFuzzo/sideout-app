import React, { useState, useEffect, useCallback } from 'react';
import { Match } from '../types';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { MatchCard } from '../components/MatchCard';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Search } from 'lucide-react';

interface FollowedMatchesTabProps {
  onNavigateToSearch: () => void;
}

export const FollowedMatchesTab: React.FC<FollowedMatchesTabProps> = ({ onNavigateToSearch }) => {
  const [subTab, setSubTab] = useState<'upcoming' | 'finished'>('upcoming');
  const [matches, setMatches] = useState<Match[]>(() => storage.getCachedFollowedMatches());
  const [loading, setLoading] = useState<boolean>(() => {
    const clubs = storage.getFollowedClubs();
    if (clubs.length === 0) return false;
    const cached = storage.getCachedFollowedMatches();
    return cached.length === 0;
  });
  const [followedClubs, setFollowedClubs] = useState<string[]>(storage.getFollowedClubs());

  const loadFollowedMatches = useCallback(async () => {
    const clubs = storage.getFollowedClubs();
    setFollowedClubs(clubs);

    if (clubs.length === 0) {
      setMatches([]);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getFollowedMatchesWithClubs([], clubs);
      setMatches(data);
      storage.updateFollowedMatchesCache(data);
    } catch (err) {
      console.error('Failed to load followed team matches', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFollowedMatches();
    const interval = setInterval(() => {
      loadFollowedMatches();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadFollowedMatches]);

  const validList = Array.isArray(matches) ? matches : [];
  const upcomingMatches = validList.filter((m) => m && m.status === 'UPCOMING');
  const finishedMatches = validList.filter((m) => m && m.status === 'FINISHED');

  return (
    <div className="space-y-4 pb-28">
      {/* Title only */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-[#f4f5f8]">
          Matchs Suivis
        </h2>
      </div>

      {/* Segmented Control with Smooth Sliding Pill */}
      <div className="relative w-full bg-[#232630] rounded-2xl p-1 h-11 flex items-center select-none">
        {/* Sliding active pill */}
        <div
          className="absolute top-1 bottom-1 rounded-xl bg-[#363a48] transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
          style={{
            left: '4px',
            width: 'calc((100% - 8px) / 2)',
            transform: `translateX(${subTab === 'upcoming' ? '0%' : '100%'})`,
            boxShadow: 'none',
          }}
        />

        <button
          onClick={() => setSubTab('upcoming')}
          className={`relative z-10 flex-1 h-full flex items-center justify-center text-xs transition-colors duration-200 outline-none focus:outline-none focus:ring-0 ${
            subTab === 'upcoming' ? 'font-bold text-[#f4f5f8]' : 'font-semibold text-[#8e93a4] hover:text-[#d4d4d8]'
          }`}
        >
          À venir
        </button>

        <button
          onClick={() => setSubTab('finished')}
          className={`relative z-10 flex-1 h-full flex items-center justify-center text-xs transition-colors duration-200 outline-none focus:outline-none focus:ring-0 ${
            subTab === 'finished' ? 'font-bold text-[#f4f5f8]' : 'font-semibold text-[#8e93a4] hover:text-[#d4d4d8]'
          }`}
        >
          Terminés
        </button>
      </div>

      {/* Content with horizontal slide transition */}
      <div className="overflow-hidden w-full pt-1">
        <div
          className="flex w-[200%] transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ transform: `translateX(${subTab === 'upcoming' ? '0%' : '-50%'})` }}
        >
          {/* 1. À venir matches */}
          <div className="w-1/2 shrink-0 space-y-3 pr-2">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-28 w-full rounded-2xl bg-[#262934]" />
                <Skeleton className="h-28 w-full rounded-2xl bg-[#262934]" />
              </div>
            ) : upcomingMatches.length > 0 ? (
              upcomingMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))
            ) : (
              /* Minimal empty state */
              <div className="text-center py-12 px-4 space-y-4">
                <h3 className="font-bold text-sm text-[#8e93a4]">
                  {followedClubs.length === 0 ? 'Aucune équipe suivie' : 'Aucun match à venir'}
                </h3>
                <Button
                  size="sm"
                  className="gap-2 bg-[#2d313e] hover:bg-[#383d4c] text-[#f4f5f8] border-0 rounded-xl outline-none focus:outline-none focus:ring-0 shadow-none cursor-pointer"
                  style={{ boxShadow: 'none' }}
                  onClick={onNavigateToSearch}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Rechercher une équipe</span>
                </Button>
              </div>
            )}
          </div>

          {/* 2. Terminés matches */}
          <div className="w-1/2 shrink-0 space-y-3 pl-2">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-28 w-full rounded-2xl bg-[#262934]" />
              </div>
            ) : finishedMatches.length > 0 ? (
              finishedMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))
            ) : (
              /* Minimal empty state */
              <div className="text-center py-12 px-4">
                <h3 className="font-bold text-sm text-[#8e93a4]">
                  {followedClubs.length === 0 ? 'Aucune équipe suivie' : 'Aucun match terminé'}
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
