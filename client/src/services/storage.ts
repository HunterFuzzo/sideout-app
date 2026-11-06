import { Match, NotificationSettings } from '../types';

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

  // --- Followed Teams / Clubs ---
  getFollowedClubs(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOLLOWED_TEAMS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isClubFollowed(clubName: string): boolean {
    if (!clubName) return false;
    const norm = clubName.trim().toLowerCase();
    return this.getFollowedClubs().some((c) => c.toLowerCase() === norm);
  },

  toggleFollowClub(clubName: string): boolean {
    if (!clubName) return false;
    const clean = clubName.trim();
    let list = this.getFollowedClubs();
    const index = list.findIndex((c) => c.toLowerCase() === clean.toLowerCase());
    let isFollowed = false;
    if (index >= 0) {
      list = list.filter((c) => c.toLowerCase() !== clean.toLowerCase());
      isFollowed = false;
    } else {
      list.push(clean);
      isFollowed = true;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.FOLLOWED_TEAMS, JSON.stringify(list));
      if (!isFollowed && list.length === 0) {
        this.clearMatchesCache();
      }
    } catch {}
    return isFollowed;
  },

  removeFollowedClub(clubName: string): void {
    if (!clubName) return;
    const clean = clubName.trim().toLowerCase();
    const list = this.getFollowedClubs().filter((c) => c.toLowerCase() !== clean);
    try {
      localStorage.setItem(STORAGE_KEYS.FOLLOWED_TEAMS, JSON.stringify(list));
      if (list.length === 0) {
        this.clearMatchesCache();
      }
    } catch {}
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
