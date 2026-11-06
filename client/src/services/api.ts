import { Competition, Match, PouleDetails, FollowedTeam } from '../types';
import { storage, LOCAL_SERVER_URL } from './storage';
import fallbackData from '../data/fallbackCompetitions.json';
import fallbackPoulesData from '../data/fallbackPoules.json';

const fallbackCompetitions: Competition[] = (fallbackData as any).competitions || [];
const fallbackPoules: Record<string, PouleDetails> = fallbackPoulesData as any;

async function fetchWithFallback<T>(path: string): Promise<T> {
  const primaryUrl = storage.getServerUrl();
  const targetUrls = [
    `${primaryUrl}${path}`,
    // If primary is different from localhost, try localhost as fallback
    ...(primaryUrl !== LOCAL_SERVER_URL ? [`${LOCAL_SERVER_URL}${path}`] : []),
  ];

  let lastError: Error | null = null;
  for (const url of targetUrls) {
    try {
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        return await res.json() as T;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error(`Impossible de contacter l'API Sideout (${path})`);
}

export const api = {
  async getCompetitions(saison = '2026/2027'): Promise<Competition[]> {
    try {
      const res = await fetchWithFallback<{ competitions: Competition[] }>(
        `/api/competitions?saison=${encodeURIComponent(saison)}`
      );
      if (res && res.competitions && res.competitions.length > 0) {
        return res.competitions;
      }
    } catch (err) {
      console.warn('Network fetch failed, using embedded fallback competitions', err);
    }
    return fallbackCompetitions;
  },

  async getPouleDetails(poule: string, saison = '2026/2027'): Promise<PouleDetails> {
    try {
      const res = await fetchWithFallback<PouleDetails>(
        `/api/competitions/${encodeURIComponent(poule)}?saison=${encodeURIComponent(saison)}`
      );
      if (res && (res.ranking || res.matches)) {
        return res;
      }
    } catch (err) {
      console.warn(`Network fetch failed for poule ${poule}, using embedded fallback`, err);
    }

    if (fallbackPoules[poule]) {
      return fallbackPoules[poule];
    }

    // Minimal fallback
    const comp = fallbackCompetitions.find((c) => c.poule === poule) || {
      poule,
      name: poule,
      division: 'REGIONALE' as const,
      genre: 'MASCULIN' as const,
      pouleLabel: '',
      saison,
      codent: 'LICA',
    };

    return {
      competition: comp,
      ranking: [],
      matches: [],
      lastUpdated: new Date().toISOString(),
    };
  },

  async getFollowedMatches(ids: string[], saison = '2026/2027'): Promise<Match[]> {
    if (ids.length === 0) return [];
    const res = await fetchWithFallback<{ matches: Match[] }>(
      `/api/matches/followed?ids=${encodeURIComponent(ids.join(','))}&saison=${encodeURIComponent(saison)}`
    );
    return res.matches;
  },

  getMatchSheetUrl(matchId: string, type: 'match' | 'convocation', saison = '2026/2027', codent = 'LICA'): string {
    const cleanId = matchId.toUpperCase().replace(/[^A-Z0-9_]/g, '');
    if (type === 'match') {
      // Direct official FFVB FDME URL - works directly anywhere
      return `https://www.ffvbbeach.org/ffvbapp/resu/ffvolley_fdme.php?saison=${encodeURIComponent(saison)}&codent=${encodeURIComponent(codent)}&codmatch=${encodeURIComponent(cleanId)}`;
    }
    const primaryUrl = storage.getServerUrl();
    return `${primaryUrl}/api/matches/${encodeURIComponent(cleanId)}/sheet?type=convocation&saison=${encodeURIComponent(saison)}&codent=${encodeURIComponent(codent)}`;
  },

  async getFollowedMatchesForTeams(followedTeams: FollowedTeam[], saison = '2026/2027'): Promise<Match[]> {
    const matchMap = new Map<string, Match>();
    if (!followedTeams || followedTeams.length === 0) {
      return [];
    }

    try {
      // 1. Teams that have an explicit poule (most accurate and fast)
      const pouleGroups = new Map<string, FollowedTeam[]>();
      const teamsWithoutPoule: FollowedTeam[] = [];

      for (const ft of followedTeams) {
        if (ft.poule) {
          const p = ft.poule.toUpperCase();
          if (!pouleGroups.has(p)) pouleGroups.set(p, []);
          pouleGroups.get(p)!.push(ft);
        } else {
          teamsWithoutPoule.push(ft);
        }
      }

      // Fetch poules for teams with specified poule
      await Promise.allSettled(
        Array.from(pouleGroups.entries()).map(async ([pouleCode, teams]) => {
          const details = await this.getPouleDetails(pouleCode, saison);
          const lowerTeams = teams.map((t) => t.team.toLowerCase().trim());

          details.matches.forEach((m) => {
            // Strictly check poule match
            if (m.poule && m.poule.toUpperCase() !== pouleCode) return;

            const home = m.homeTeam.toLowerCase();
            const away = m.awayTeam.toLowerCase();
            const matchesTeam = lowerTeams.some(
              (lt) => home.includes(lt) || lt.includes(home) || away.includes(lt) || lt.includes(away)
            );
            if (matchesTeam) {
              matchMap.set(m.id, m);
            }
          });
        })
      );

      // 2. Teams without poule (legacy fallback)
      if (teamsWithoutPoule.length > 0) {
        const comps = await this.getCompetitions(saison);
        const lowerClubs = teamsWithoutPoule.map((c) => c.team.toLowerCase().trim());

        const relevantPoules = comps.filter((comp) => {
          return (comp.teams || []).some((t) =>
            lowerClubs.some((club) => t.toLowerCase().includes(club) || club.includes(t.toLowerCase()))
          );
        });

        await Promise.allSettled(
          relevantPoules.map(async (comp) => {
            const details = await this.getPouleDetails(comp.poule, saison);
            details.matches.forEach((m) => {
              const home = m.homeTeam.toLowerCase();
              const away = m.awayTeam.toLowerCase();
              const matchesTeam = lowerClubs.some(
                (c) => home.includes(c) || c.includes(home) || away.includes(c) || c.includes(away)
              );
              if (matchesTeam) {
                matchMap.set(m.id, m);
              }
            });
          })
        );
      }
    } catch (err) {
      console.error('Failed to load followed team matches', err);
    }

    return Array.from(matchMap.values());
  },

  async getFollowedMatchesWithClubs(ids: string[], clubNames: string[], saison = '2026/2027'): Promise<Match[]> {
    const teams: FollowedTeam[] = clubNames.map((c) => ({ team: c }));
    return this.getFollowedMatchesForTeams(teams, saison);
  },

  async testConnection(customUrl?: string): Promise<{ ok: boolean; latency: number; service?: string }> {
    const baseUrl = (customUrl || storage.getServerUrl()).replace(/\/+$/, '');
    const start = performance.now();
    try {
      const res = await fetch(`${baseUrl}/api/health`, {
        signal: AbortSignal.timeout(4000),
      });
      const latency = Math.round(performance.now() - start);
      if (res.ok) {
        const data = await res.json();
        return { ok: true, latency, service: data.service };
      }
      return { ok: false, latency };
    } catch {
      return { ok: false, latency: Math.round(performance.now() - start) };
    }
  },
};
