import React, { useState, useEffect, useMemo } from 'react';
import { Competition, PouleDetails, Match, RankingRow } from '../types';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { searchEngine } from '../services/searchEngine';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/table';
import { MatchCard } from '../components/MatchCard';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Search, ChevronRight, X, Check, Star } from 'lucide-react';

interface QuickTag {
  id: string;
  label: string;
}

const QUICK_TAGS: QuickTag[] = [
  { id: 'pro', label: 'Pro & Élite' },
  { id: 'national', label: 'National' },
  { id: 'regionale', label: 'Régionale' },
  { id: 'departementale', label: 'Départementale' },
  { id: 'beach', label: 'Beach Volley' },
  { id: 'indoor', label: 'Indoor' },
  { id: '06', label: '06 Alpes-Maritimes' },
  { id: '83', label: '83 Var' },
  { id: '13', label: '13 Bouches-du-Rhône' },
  { id: '84', label: '84 Vaucluse' },
  { id: 'senior', label: 'Senior' },
  { id: 'm18', label: 'M18' },
  { id: 'm15', label: 'M15' },
  { id: 'm13', label: 'M13' },
  { id: 'm21', label: 'M21' },
  { id: 'prenationale', label: 'Pré-Nationale' },
  { id: 'masculin', label: 'Masculin' },
  { id: 'feminin', label: 'Féminin' },
  { id: 'mixte', label: 'Mixte' },
  { id: '6x6', label: '6x6' },
  { id: '4x4', label: '4x4' },
  { id: '2x2', label: '2x2' },
  { id: 'laurentin', label: 'Stade Laurentin' },
  { id: 'cannes', label: 'Cannes' },
  { id: 'nice', label: 'Nice' },
  { id: 'antibes', label: 'Antibes' },
  { id: 'monaco', label: 'Monaco' },
];

export const SearchTab: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Tag filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Selected poule modal state
  const [selectedPoule, setSelectedPoule] = useState<string | null>(null);
  const [pouleDetails, setPouleDetails] = useState<PouleDetails | null>(null);
  const [pouleLoading, setPouleLoading] = useState(false);

  // Selected Club modal state
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [clubSubTab, setClubSubTab] = useState<'upcoming' | 'finished'>('upcoming');
  const [followedClubs, setFollowedClubs] = useState<string[]>(storage.getFollowedClubs());

  // Load competitions on mount
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.getCompetitions('2026/2027')
      .then((data) => {
        if (isMounted) {
          const list = data || [];
          setCompetitions(list);
          searchEngine.setCompetitions(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load competitions', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Load poule details when selected
  useEffect(() => {
    if (!selectedPoule) {
      setPouleDetails(null);
      return;
    }

    setPouleLoading(true);
    api.getPouleDetails(selectedPoule, '2026/2027')
      .then((details) => {
        setPouleDetails(details);
        setPouleLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load poule details', err);
        setPouleLoading(false);
      });
  }, [selectedPoule]);

  const handleToggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleToggleFollowClub = (clubName: string) => {
    storage.toggleFollowClub(clubName);
    setFollowedClubs(storage.getFollowedClubs());
  };

  // Instant fast search via MiniSearch
  const filteredCompetitions = useMemo(() => {
    return searchEngine.search(searchQuery, selectedTags);
  }, [competitions, searchQuery, selectedTags]);

  // Clean tags: NO season tag (2026/2027), NO poule code (RMA, PFA, MFA...)
  const getVisibleTags = (comp: Competition) => {
    const list: string[] = [];

    // Level
    if (comp.level === 'PRO' || comp.division === 'PRO' || comp.division === 'ELITE') list.push('Pro');
    else if (comp.level === 'NATIONAL' || comp.division === 'NATIONALE') list.push('National');
    else if (comp.level === 'DEPARTEMENTAL' || comp.division === 'DEPARTEMENTALE') list.push('Départemental');
    else if (comp.division === 'PRE_NATIONALE') list.push('Pré-Nationale');
    else list.push('Régionale');

    // Beach / Indoor
    if (comp.isBeach || comp.tags?.includes('beach')) {
      list.push('Beach');
    }

    // Age / Category
    if (comp.division === 'M11') list.push('M11');
    else if (comp.division === 'M13') list.push('M13');
    else if (comp.division === 'M15') list.push('M15');
    else if (comp.division === 'M18') list.push('M18');
    else if (comp.division === 'M21') list.push('M21');
    else if (comp.division === 'LOISIR') list.push('Loisir');
    else list.push('Senior');

    // Genre
    if (comp.genre === 'FEMININ') list.push('Féminin');
    else if (comp.genre === 'MIXTE') list.push('Mixte');
    else list.push('Masculin');

    // Format (6x6, 4x4, 2x2)
    const has4x4 = comp.tags?.includes('4x4');
    const has2x2 = comp.tags?.includes('2x2');
    list.push(has4x4 ? '4x4' : has2x2 ? '2x2' : '6x6');

    // Poule label (Poule A, Poule B, Poule Unique)
    if (comp.pouleLabel) list.push(comp.pouleLabel);

    return list;
  };

  // Clean title without the word "CHAMPIONNAT" and with middle dot • instead of -
  const cleanCompName = (name: string) => {
    return (name || '')
      .replace(/^[A-Za-z0-9_]{2,8}\s+[-–—:]?\s*/i, '')
      .replace(/^CHAMPIONNAT\s+/i, '')
      .replace(/\s*[-–—]\s*/g, ' • ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Extract club details from current poule
  const clubDetails = useMemo(() => {
    if (!selectedClub || !pouleDetails) return null;

    const rankingRow = pouleDetails.ranking?.find(
      (r) => r.team.toLowerCase() === selectedClub.toLowerCase()
    );

    const matches = pouleDetails.matches?.filter((m) => {
      const h = m.homeTeam.toLowerCase();
      const a = m.awayTeam.toLowerCase();
      const c = selectedClub.toLowerCase();
      return h.includes(c) || c.includes(h) || a.includes(c) || c.includes(a);
    }) || [];

    const upcoming = matches.filter((m) => m.status === 'UPCOMING');
    const finished = matches.filter((m) => m.status === 'FINISHED');

    const isFollowed = followedClubs.some(
      (c) => c.toLowerCase() === selectedClub.toLowerCase()
    );

    return {
      name: selectedClub,
      rankingRow,
      upcoming,
      finished,
      isFollowed,
      competitionName: cleanCompName(pouleDetails.competition?.name || ''),
    };
  }, [selectedClub, pouleDetails, followedClubs]);

  return (
    <div className="space-y-4 pb-28">
      {/* Title only */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-[#f4f5f8]">
          Recherche & Compétitions
        </h2>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8e93a4]" />
        <Input
          placeholder="Rechercher par club, poule, mot-clé..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-9 bg-[#232630] border-0 text-[#f4f5f8] h-11 rounded-2xl text-sm placeholder:text-[#8e93a4] outline-none focus:outline-none focus:ring-0"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3.5 text-[#8e93a4] hover:text-[#f4f5f8] outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tags Carousel with Croix (X) icon to clear all filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
        {/* Croix (X) button to reset all selected tags in one click */}
        {selectedTags.length > 0 && (
          <button
            onClick={() => setSelectedTags([])}
            className="shrink-0 flex items-center justify-center p-2 rounded-xl bg-[#363a48] text-[#f4f5f8] hover:bg-[#404656] transition-colors outline-none"
            title="Effacer tous les filtres"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {QUICK_TAGS.map((tag) => {
          const active = selectedTags.includes(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => handleToggleTag(tag.id)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-xl transition-all outline-none focus:outline-none focus:ring-0 select-none ${
                active
                  ? 'bg-[#3b4152] text-[#f4f5f8] font-bold shadow-none'
                  : 'bg-[#232630] text-[#8e93a4] hover:text-[#d4d4d8] hover:bg-[#282d3a]'
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      {/* Competitions List */}
      <div className="space-y-2.5 pt-1">
        {loading ? (
          <div className="space-y-2.5">
            <Skeleton className="h-24 w-full rounded-2xl bg-[#232630]" />
            <Skeleton className="h-24 w-full rounded-2xl bg-[#232630]" />
            <Skeleton className="h-24 w-full rounded-2xl bg-[#232630]" />
          </div>
        ) : filteredCompetitions.length > 0 ? (
          filteredCompetitions.map((comp) => {
            const q = searchQuery.toLowerCase().trim();
            const matchedTeam = q && comp.teams?.find((t) => t.toLowerCase().includes(q));
            const tags = getVisibleTags(comp);

            return (
              <Card
                key={comp.poule}
                onClick={() => setSelectedPoule(comp.poule)}
                className="cursor-pointer border-0 bg-[#232630] hover:bg-[#282c38] transition-all p-3.5 flex items-center justify-between gap-3 rounded-2xl outline-none shadow-none"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Clean tags: NO season tag, NO poule code */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-lg font-medium bg-[#2b2e3a] text-[#c4c8d4]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Clean title without "CHAMPIONNAT" */}
                  <h4 className="text-sm font-bold text-[#f4f5f8] truncate">
                    {cleanCompName(comp.name)}
                  </h4>
                </div>

                <div className="flex items-center gap-1 text-[#8e93a4] shrink-0">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Card>
            );
          })
        ) : (
          /* Clean minimal empty state: NO cadre, text only */
          <div className="text-center py-12 px-4">
            <h4 className="font-semibold text-sm text-[#8e93a4]">Aucun résultat</h4>
          </div>
        )}
      </div>

      {/* 1. Poule Detail Dialog (Fits mobile screens, no overflow) */}
      <Dialog open={!!selectedPoule && !selectedClub} onOpenChange={(open) => !open && setSelectedPoule(null)}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-md p-4 bg-[#20232c] border-0 rounded-3xl text-[#f4f5f8] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
          {pouleLoading ? (
            <div className="space-y-4 py-8">
              <Skeleton className="h-6 w-3/4 rounded-xl bg-[#282c38]" />
              <Skeleton className="h-4 w-1/2 rounded-xl bg-[#282c38]" />
              <Skeleton className="h-48 w-full rounded-2xl bg-[#282c38]" />
            </div>
          ) : pouleDetails ? (
            <div className="space-y-3.5 flex flex-col max-h-full overflow-hidden">
              <DialogHeader className="text-left space-y-1 pr-6 shrink-0">
                <DialogTitle className="text-base font-black text-[#f4f5f8] leading-tight break-words">
                  {cleanCompName(pouleDetails.competition?.name || selectedPoule || '')}
                </DialogTitle>
                <DialogDescription className="text-xs text-[#8e93a4]">
                  {pouleDetails.ranking?.length || 0} équipes engagées • Touchez une équipe pour ses détails
                </DialogDescription>
              </DialogHeader>

              {/* Tabs: Classement / Matchs & Scores */}
              <Tabs defaultValue="ranking" className="w-full flex-1 flex flex-col overflow-hidden">
                <TabsList className="grid w-full grid-cols-2 bg-[#181a20] border-0 h-10 p-1 rounded-xl shrink-0">
                  <TabsTrigger
                    value="ranking"
                    className="text-xs font-bold data-[state=active]:bg-[#363a49] data-[state=active]:text-[#f4f5f8] data-[state=active]:shadow-none data-[state=active]:border-0 border-0 outline-none"
                  >
                    Classement
                  </TabsTrigger>
                  <TabsTrigger
                    value="schedule"
                    className="text-xs font-bold data-[state=active]:bg-[#363a49] data-[state=active]:text-[#f4f5f8] data-[state=active]:shadow-none data-[state=active]:border-0 border-0 outline-none"
                  >
                    Matchs & Scores
                  </TabsTrigger>
                </TabsList>

                {/* Classement Tab: Touching a row opens Club Details */}
                <TabsContent value="ranking" className="mt-3 overflow-y-auto flex-1">
                  <div className="overflow-x-auto rounded-xl bg-[#181a20] w-full">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-[#282c38] text-[11px] text-[#8e93a4]">
                          <TableHead className="w-8 text-center text-[#8e93a4]">#</TableHead>
                          <TableHead className="text-[#8e93a4]">Équipe</TableHead>
                          <TableHead className="text-right text-[#8e93a4]">Pts</TableHead>
                          <TableHead className="text-right text-[#8e93a4]">J</TableHead>
                          <TableHead className="text-right text-[#8e93a4]">G</TableHead>
                          <TableHead className="text-right text-[#8e93a4]">P</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(pouleDetails.ranking || []).map((team) => (
                          <TableRow
                            key={team.rank}
                            onClick={() => setSelectedClub(team.team)}
                            className="border-b border-[#282c38] text-xs cursor-pointer hover:bg-[#282c38] active:bg-[#323646] transition-colors"
                          >
                            <TableCell className="text-center font-bold text-[#8e93a4]">
                              {team.rank}
                            </TableCell>
                            <TableCell className="font-bold text-[#f4f5f8] truncate max-w-[150px]">
                              {team.team}
                            </TableCell>
                            <TableCell className="text-right font-black text-[#f4f5f8]">
                              {team.points}
                            </TableCell>
                            <TableCell className="text-right text-[#8e93a4]">{team.played}</TableCell>
                            <TableCell className="text-right text-[#8e93a4]">{team.won}</TableCell>
                            <TableCell className="text-right text-[#8e93a4]">{team.lost}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-2 mt-3 overflow-y-auto overflow-x-hidden flex-1 pr-1 w-full">
                  {(pouleDetails.matches || []).map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* 2. Club Details Dialog (Opens when tapping any club) */}
      <Dialog open={!!selectedClub} onOpenChange={(open) => !open && setSelectedClub(null)}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-md p-4 bg-[#20232c] border-0 rounded-3xl text-[#f4f5f8] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
          {clubDetails && (
            <div className="space-y-3.5 flex flex-col max-h-full overflow-hidden">
              <DialogHeader className="text-left space-y-2 pr-6 shrink-0">
                <div className="space-y-1">
                  <span className="text-[11px] text-[#8e93a4] font-medium">
                    {clubDetails.competitionName}
                  </span>
                  <DialogTitle className="text-base font-black text-[#f4f5f8] leading-tight break-words">
                    {clubDetails.name}
                  </DialogTitle>
                </div>

                {/* Bouton Suivre le club */}
                <Button
                  size="sm"
                  onClick={() => handleToggleFollowClub(clubDetails.name)}
                  className={`w-full h-9 rounded-xl text-xs font-bold border-0 transition-all outline-none focus:outline-none focus:ring-0 ${
                    clubDetails.isFollowed
                      ? 'bg-[#3b4152] text-[#f4f5f8] hover:bg-[#454c60]'
                      : 'bg-[#2b2f3d] text-[#f4f5f8] hover:bg-[#343846]'
                  }`}
                  style={{ boxShadow: 'none' }}
                >
                  {clubDetails.isFollowed ? (
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Check className="w-4 h-4" />
                      Équipe suivie (matchs synchronisés)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5" />
                      Suivre cette équipe
                    </span>
                  )}
                </Button>
              </DialogHeader>

              {/* Club Ranking Summary */}
              {clubDetails.rankingRow && (
                <div className="bg-[#181a20] rounded-2xl p-3 flex items-center justify-around text-center shrink-0">
                  <div>
                    <span className="text-[10px] text-[#8e93a4] block">Rang</span>
                    <span className="text-base font-black text-[#f4f5f8]">
                      #{clubDetails.rankingRow.rank}
                    </span>
                  </div>
                  <div className="w-[1px] h-6 bg-[#282c38]" />
                  <div>
                    <span className="text-[10px] text-[#8e93a4] block">Points</span>
                    <span className="text-base font-black text-[#f4f5f8]">
                      {clubDetails.rankingRow.points}
                    </span>
                  </div>
                  <div className="w-[1px] h-6 bg-[#282c38]" />
                  <div>
                    <span className="text-[10px] text-[#8e93a4] block">V / D</span>
                    <span className="text-sm font-bold text-[#8e93a4]">
                      {clubDetails.rankingRow.won} / {clubDetails.rankingRow.lost}
                    </span>
                  </div>
                  <div className="w-[1px] h-6 bg-[#282c38]" />
                  <div>
                    <span className="text-[10px] text-[#8e93a4] block">Ratio Sets</span>
                    <span className="text-xs font-mono font-bold text-[#8e93a4]">
                      {clubDetails.rankingRow.setsRatio || `${clubDetails.rankingRow.setsWon}:${clubDetails.rankingRow.setsLost}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Matchs du club: À venir / Terminés with sliding pill */}
              <div className="flex-1 flex flex-col overflow-hidden space-y-2">
                <div className="relative w-full bg-[#181a20] rounded-xl p-1 h-9 flex items-center select-none shrink-0">
                  <div
                    className="absolute top-1 bottom-1 rounded-lg bg-[#363a48] transition-transform duration-250 ease-out pointer-events-none"
                    style={{
                      left: '4px',
                      width: 'calc((100% - 8px) / 2)',
                      transform: `translateX(${clubSubTab === 'upcoming' ? '0%' : '100%'})`,
                      boxShadow: 'none',
                    }}
                  />
                  <button
                    onClick={() => setClubSubTab('upcoming')}
                    className={`relative z-10 flex-1 h-full text-xs font-bold transition-colors ${
                      clubSubTab === 'upcoming' ? 'text-[#f4f5f8]' : 'text-[#8e93a4]'
                    }`}
                  >
                    À venir ({clubDetails.upcoming.length})
                  </button>
                  <button
                    onClick={() => setClubSubTab('finished')}
                    className={`relative z-10 flex-1 h-full text-xs font-bold transition-colors ${
                      clubSubTab === 'finished' ? 'text-[#f4f5f8]' : 'text-[#8e93a4]'
                    }`}
                  >
                    Terminés ({clubDetails.finished.length})
                  </button>
                </div>

                <div className="overflow-y-auto overflow-x-hidden flex-1 space-y-2 pr-1">
                  {(clubSubTab === 'upcoming' ? clubDetails.upcoming : clubDetails.finished).length > 0 ? (
                    (clubSubTab === 'upcoming' ? clubDetails.upcoming : clubDetails.finished).map((m) => (
                      <MatchCard key={m.id} match={m} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-xs text-[#8e93a4]">
                        {clubSubTab === 'upcoming'
                          ? 'Aucun match à venir pour ce club'
                          : 'Aucun match terminé pour ce club'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
