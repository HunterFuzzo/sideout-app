import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Match } from '../types';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { MatchCard } from '../components/MatchCard';
import { Button } from '../components/ui/Button';
import { Search } from 'lucide-react-native';

interface FollowedMatchesScreenProps {
  onNavigateToSearch: () => void;
}

export const FollowedMatchesScreen: React.FC<FollowedMatchesScreenProps> = ({
  onNavigateToSearch,
}) => {
  const [subTab, setSubTab] = useState<'upcoming' | 'finished'>('upcoming');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followedIds, setFollowedIds] = useState<string[]>([]);

  const loadFollowedMatches = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const ids = await storage.getFollowedMatchIds();
      setFollowedIds(ids);

      if (ids.length === 0) {
        setMatches([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const data = await api.getFollowedMatches(ids);
      setMatches(data);
    } catch (err) {
      console.error('Failed to load followed matches', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFollowedMatches();
    // Silent automatic instant refresh every 15 seconds
    const interval = setInterval(() => {
      loadFollowedMatches(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [loadFollowedMatches]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFollowedMatches(true);
  };

  const handleToggleFollow = async (id: string) => {
    await storage.toggleFollowMatch(id);
    const updated = await storage.getFollowedMatchIds();
    setFollowedIds(updated);
    setMatches((prev) => prev.filter((m) => updated.includes(m.id)));
  };

  const upcomingMatches = matches.filter((m) => m.status === 'UPCOMING');
  const finishedMatches = matches.filter((m) => m.status === 'FINISHED');
  const displayedMatches = subTab === 'upcoming' ? upcomingMatches : finishedMatches;

  return (
    <View style={styles.container}>
      {/* Title only */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Matchs Suivis</Text>
      </View>

      {/* Sub Tabs: À venir / Terminés (no 0 counters, no border, no white contours) */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.tabButton, subTab === 'upcoming' && styles.tabButtonActive]}
          onPress={() => setSubTab('upcoming')}
        >
          <Text style={[styles.tabText, subTab === 'upcoming' && styles.tabTextActive]}>
            À venir
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.tabButton, subTab === 'finished' && styles.tabButtonActive]}
          onPress={() => setSubTab('finished')}
        >
          <Text style={[styles.tabText, subTab === 'finished' && styles.tabTextActive]}>
            Terminés
          </Text>
        </TouchableOpacity>
      </View>

      {/* List or Empty State */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#8E93A4" />
          <Text style={styles.loadingText}>Chargement des résultats...</Text>
        </View>
      ) : displayedMatches.length > 0 ? (
        <FlatList
          data={displayedMatches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MatchCard
              match={item}
              isFollowed={followedIds.includes(item.id)}
              onToggleFollow={handleToggleFollow}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#8E93A4"
              colors={['#8E93A4']}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        /* Minimal Empty State: NO cadre, text and button only */
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            {subTab === 'upcoming' ? 'Aucun match à venir' : 'Aucun match terminé'}
          </Text>
          {subTab === 'upcoming' && (
            <Button
              size="sm"
              onPress={onNavigateToSearch}
              style={styles.emptyActionBtn}
            >
              <Search size={14} color="#F4F5F8" style={{ marginRight: 6 }} />
              <Text style={{ color: '#F4F5F8', fontWeight: '700', fontSize: 13 }}>
                Rechercher une équipe
              </Text>
            </Button>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerRow: {
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F4F5F8',
    letterSpacing: -0.5,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#232630',
    borderRadius: 16,
    padding: 3,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: '#363A48',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E93A4',
  },
  tabTextActive: {
    color: '#F4F5F8',
    fontWeight: '800',
  },
  listContent: {
    paddingBottom: 24,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    fontSize: 13,
    color: '#8E93A4',
    marginTop: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8E93A4',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyActionBtn: {
    backgroundColor: '#2D313E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 0,
  },
});
