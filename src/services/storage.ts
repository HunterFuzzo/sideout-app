import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SERVER_URL: 'sideout_native_server_url',
  FOLLOWED_MATCHES: 'sideout_native_followed_matches',
};

// Default server pointing directly to the user's remote server on port 4050
export const DEFAULT_SERVER_URL = 'http://100.108.66.65:4050';
export const LOCAL_SERVER_URL = 'http://10.106.129.14:4050';

export const storage = {
  async getServerUrl(): Promise<string> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SERVER_URL);
      if (stored && (stored.startsWith('http://') || stored.startsWith('https://'))) {
        return stored.replace(/\/+$/, '');
      }
    } catch {}
    return DEFAULT_SERVER_URL;
  },

  async setServerUrl(url: string): Promise<void> {
    try {
      const clean = url.trim().replace(/\/+$/, '');
      await AsyncStorage.setItem(STORAGE_KEYS.SERVER_URL, clean);
    } catch {}
  },

  async getFollowedMatchIds(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FOLLOWED_MATCHES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async isMatchFollowed(matchId: string): Promise<boolean> {
    const list = await this.getFollowedMatchIds();
    return list.includes(matchId);
  },

  async toggleFollowMatch(matchId: string): Promise<boolean> {
    const list = await this.getFollowedMatchIds();
    const index = list.indexOf(matchId);
    let isFollowed = false;
    if (index >= 0) {
      list.splice(index, 1);
      isFollowed = false;
    } else {
      list.push(matchId);
      isFollowed = true;
    }
    await AsyncStorage.setItem(STORAGE_KEYS.FOLLOWED_MATCHES, JSON.stringify(list));
    return isFollowed;
  },

  async clearFollowed(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.FOLLOWED_MATCHES);
    } catch {}
  },
};
