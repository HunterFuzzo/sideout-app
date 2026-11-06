import { Competition, Match, PouleDetails } from '../types';
import { storage, LOCAL_SERVER_URL } from './storage';

async function fetchWithFallback<T>(path: string): Promise<T> {
  const primaryUrl = await storage.getServerUrl();
  const targetUrls = [
    `${primaryUrl}${path}`,
    ...(primaryUrl !== LOCAL_SERVER_URL ? [`${LOCAL_SERVER_URL}${path}`] : []),
  ];

  let lastError: Error | null = null;
  for (const url of targetUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return (await res.json()) as T;
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

  async testConnection(customUrl?: string): Promise<{ ok: boolean; latency: number; service?: string }> {
    const baseUrl = ((customUrl || (await storage.getServerUrl()))).replace(/\/+$/, '');
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${baseUrl}/api/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const latency = Date.now() - start;
      if (res.ok) {
        const data = await res.json();
        return { ok: true, latency, service: data.service };
      }
      return { ok: false, latency };
    } catch {
      return { ok: false, latency: Date.now() - start };
    }
  },
};
