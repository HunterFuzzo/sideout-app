import { Match, NotificationSettings, FollowedTeam } from '../types';

const STORAGE_KEYS = {
  SERVER_URL: 'sideout_server_url',
  FOLLOWED_TEAMS: 'sideout_followed_clubs',
  MATCHES_CACHE: 'sideout_followed_matches_cache',
  NOTIFICATIONS: 'sideout_notifications_settings',
  FAVORITE_CLUB: 'sideout_favorite_club',
};

export const DEFAULT_SERVER_URL = 'http://100.108.66.65:4050';
export const LOCAL_SERVER_URL = 'http://localhost:4050';

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  resultsEnabled: true,
  matchRemindersEnabled: true,
  favoriteClub: '',
};

export const storage = {
  getServerUrl(): string {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SERVER_URL);
      if (stored && (stored.startsWith('http://') || stored.startsWith('https://'))) {
        const fixed = stored.replace(':4000', ':4050').replace(/\/+$/, '');
        if (fixed !== stored) {
          localStorage.setItem(STORAGE_KEYS.SERVER_URL, fixed);
        }
        return fixed;
      }
    } catch {}
    return DEFAULT_SERVER_URL;
  },

  setServerUrl(url: string): void {
    try {
      const clean = url.trim().replace(/\/+$/, '');
      localStorage.setItem(STORAGE_KEYS.SERVER_URL, clean);
    } catch {}
  },

  // --- Followed Teams (with Poule context) ---
  getFollowedTeams(): FollowedTeam[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOLLOWED_TEAMS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];

      let modified = false;
      const list: FollowedTeam[] = parsed.map((item) => {
        if (typeof item === 'string') {
          // Legacy string migration
          if (item.includes('::')) {
            const [team, poule, competitionName] = item.split('::');
            return { team: team.trim(), poule: poule?.trim(), competitionName: competitionName?.trim() };
          }
          // If legacy plain "VOLLEY-BALL STADE LAURENTIN", migrate to RMA Régionale
          if (item.toUpperCase().includes('LAURENTIN')) {
            modified = true;
            return {
              team: item.trim(),
              poule: 'RMA',
              competitionName: 'Régionale Masculine',
            };
          }
          return { team: item.trim() };
        }
        return item as FollowedTeam;
      });

      if (modified) {
        localStorage.setItem(STORAGE_KEYS.FOLLOWED_TEAMS, JSON.stringify(list));
      }

      return list;
    } catch {
      return [];
    }
  },

  getFollowedClubs(): string[] {
    return this.getFollowedTeams().map((t) => t.team);
  },

  isTeamFollowed(teamName: string, poule?: string): boolean {
    if (!teamName) return false;
    const norm = teamName.trim().toLowerCase();
    const list = this.getFollowedTeams();
    return list.some((ft) => {
      const teamMatch = ft.team.trim().toLowerCase() === norm;
      if (!teamMatch) return false;
      if (poule && ft.poule) {
        return ft.poule.trim().toUpperCase() === poule.trim().toUpperCase();
      }
      return true;
    });
  },

  isClubFollowed(clubName: string, poule?: string): boolean {
    return this.isTeamFollowed(clubName, poule);
  },

  toggleFollowTeam(teamName: string, poule?: string, competitionName?: string): boolean {
    if (!teamName) return false;
    const cleanTeam = teamName.trim();
    const cleanPoule = poule?.trim().toUpperCase();
    const cleanComp = competitionName?.trim();

    let list = this.getFollowedTeams();
    const existingIndex = list.findIndex((ft) => {
      const nameMatch = ft.team.toLowerCase() === cleanTeam.toLowerCase();
      if (!nameMatch) return false;
      if (cleanPoule && ft.poule) {
        return ft.poule.toUpperCase() === cleanPoule;
      }
      return true;
    });

    let isFollowed = false;
    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      isFollowed = false;
    } else {
      list.push({
        team: cleanTeam,
        poule: cleanPoule,
        competitionName: cleanComp,
      });
      isFollowed = true;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.FOLLOWED_TEAMS, JSON.stringify(list));
      this.clearMatchesCache();
    } catch {}
    return isFollowed;
  },

  toggleFollowClub(clubName: string, poule?: string, competitionName?: string): boolean {
    return this.toggleFollowTeam(clubName, poule, competitionName);
  },

  removeFollowedTeam(teamName: string, poule?: string): void {
    if (!teamName) return;
    const cleanTeam = teamName.trim().toLowerCase();
    const cleanPoule = poule?.trim().toUpperCase();
    let list = this.getFollowedTeams().filter((ft) => {
      const matchTeam = ft.team.toLowerCase() === cleanTeam;
      if (!matchTeam) return true;
      if (cleanPoule && ft.poule) {
        return ft.poule.toUpperCase() !== cleanPoule;
      }
      return false;
    });
    try {
      localStorage.setItem(STORAGE_KEYS.FOLLOWED_TEAMS, JSON.stringify(list));
      this.clearMatchesCache();
    } catch {}
  },

  removeFollowedClub(clubName: string, poule?: string): void {
    this.removeFollowedTeam(clubName, poule);
  },

  clearAllFollowed(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.FOLLOWED_TEAMS);
      localStorage.removeItem(STORAGE_KEYS.MATCHES_CACHE);
      localStorage.removeItem('sideout_followed_matches');
    } catch {}
  },

  // --- Matches Cache for Followed Teams ---
  getCachedFollowedMatches(): Match[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MATCHES_CACHE);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      if (typeof parsed === 'object' && parsed !== null) {
        return Object.values(parsed) as Match[];
      }
      return [];
    } catch {
      return [];
    }
  },

  updateFollowedMatchesCache(matches: Match[]): void {
    try {
      const validArray = Array.isArray(matches) ? matches : [];
      localStorage.setItem(STORAGE_KEYS.MATCHES_CACHE, JSON.stringify(validArray));
    } catch {}
  },

  clearMatchesCache(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.MATCHES_CACHE);
    } catch {}
  },

  // --- Notifications & Preferences ---
  getNotificationSettings(): NotificationSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (data) {
        return { ...DEFAULT_NOTIFICATIONS, ...JSON.parse(data) };
      }
    } catch {}
    return DEFAULT_NOTIFICATIONS;
  },

  saveNotificationSettings(settings: Partial<NotificationSettings>): NotificationSettings {
    const current = this.getNotificationSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    } catch {}
    return updated;
  },

  getFavoriteClub(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.FAVORITE_CLUB) || '';
    } catch {
      return '';
    }
  },

  setFavoriteClub(club: string): void {
    try {
      const clean = club.trim();
      localStorage.setItem(STORAGE_KEYS.FAVORITE_CLUB, clean);
    } catch {}
  },
};

// Cleanup any old match follow data & invalid cache format
try {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sideout_followed_matches');
    const cached = localStorage.getItem(STORAGE_KEYS.MATCHES_CACHE);
    if (cached && !cached.startsWith('[')) {
      localStorage.removeItem(STORAGE_KEYS.MATCHES_CACHE);
    }
  }
} catch {}
