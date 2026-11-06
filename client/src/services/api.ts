import { Competition, Match, PouleDetails } from '../types';
import { storage, LOCAL_SERVER_URL } from './storage';

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
        signal: AbortSignal.timeout(5000),
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
    const res = await fetchWithFallback<{ competitions: Competition[] }>(
      `/api/competitions?saison=${encodeURIComponent(saison)}`
    );
    return res.competitions;
  },

  async getPouleDetails(poule: string, saison = '2026/2027'): Promise<PouleDetails> {
    return await fetchWithFallback<PouleDetails>(
      `/api/competitions/${encodeURIComponent(poule)}?saison=${encodeURIComponent(saison)}`
    );
  },

  async getFollowedMatches(ids: string[], saison = '2026/2027'): Promise<Match[]> {
    if (ids.length === 0) return [];
    const res = await fetchWithFallback<{ matches: Match[] }>(
      `/api/matches/followed?ids=${encodeURIComponent(ids.join(','))}&saison=${encodeURIComponent(saison)}`
    );
    return res.matches;
  },

  getMatchSheetUrl(matchId: string, type: 'match' | 'convocation', saison = '2026/2027', codent = 'LICA'): string {
    const primaryUrl = storage.getServerUrl();
    return `${primaryUrl}/api/matches/${encodeURIComponent(matchId)}/sheet?type=${type}&saison=${encodeURIComponent(saison)}&codent=${encodeURIComponent(codent)}`;
  },

  async getFollowedMatchesWithClubs(ids: string[], clubNames: string[], saison = '2026/2027'): Promise<Match[]> {
    const matchMap = new Map<string, Match>();

    // 1. Direct match IDs
    if (ids.length > 0) {
      try {
        const directMatches = await this.getFollowedMatches(ids, saison);
        directMatches.forEach((m) => matchMap.set(m.id, m));
      } catch {}
    }

    // 2. Matches from followed clubs
    if (clubNames.length > 0) {
      try {
        const comps = await this.getCompetitions(saison);
        const lowerClubs = clubNames.map((c) => c.toLowerCase().trim());

        const relevantPoules = comps.filter((comp) => {
          return (comp.teams || []).some((t) =>
            lowerClubs.some((club) => t.toLowerCase().includes(club) || club.includes(t.toLowerCase()))
          );
        });

        await Promise.allSettled(
          relevantPoules.map(async (comp) => {
            const details = await this.getPouleDetails(comp.poule, saison);
            details.matches.forEach((m) => {
              const homeMatch = lowerClubs.some((c) => m.homeTeam.toLowerCase().includes(c) || c.includes(m.homeTeam.toLowerCase()));
              const awayMatch = lowerClubs.some((c) => m.awayTeam.toLowerCase().includes(c) || c.includes(m.awayTeam.toLowerCase()));
              if (homeMatch || awayMatch) {
                matchMap.set(m.id, m);
              }
            });
          })
        );
      } catch (err) {
        console.error('Failed to load club matches', err);
      }
    }

    return Array.from(matchMap.values());
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
