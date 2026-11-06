import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FollowedMatchesScreen } from './src/screens/FollowedMatchesScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { Home, Search, Settings } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

type TabKey = 'matches' | 'search' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('matches');

  const handleTabChange = (tab: TabKey) => {
    if (tab !== activeTab) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      setActiveTab(tab);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />

        {/* Tab Content Area */}
        <View style={styles.content}>
          {activeTab === 'matches' && (
            <FollowedMatchesScreen onNavigateToSearch={() => handleTabChange('search')} />
          )}
          {activeTab === 'search' && <SearchScreen />}
          {activeTab === 'settings' && <SettingsScreen />}
        </View>

        {/* Floating Capsule Nav Bar (matches user's screenshot) */}
        <View style={styles.floatingNavWrapper} pointerEvents="box-none">
          <View style={styles.floatingNav}>
            {/* Tab 1: Matchs (Home / Maison icon) */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.navItem,
                activeTab === 'matches' && styles.navItemActive,
              ]}
              onPress={() => handleTabChange('matches')}
            >
              <Home
                size={20}
                color={activeTab === 'matches' ? '#F4F5F8' : '#8E93A4'}
              />
              <Text
                style={[
                  styles.navLabel,
                  activeTab === 'matches' && styles.navLabelActive,
                ]}
              >
                Matchs
              </Text>
            </TouchableOpacity>

            {/* Tab 2: Recherche (Search icon) */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.navItem,
                activeTab === 'search' && styles.navItemActive,
              ]}
              onPress={() => handleTabChange('search')}
            >
              <Search
                size={20}
                color={activeTab === 'search' ? '#F4F5F8' : '#8E93A4'}
              />
              <Text
                style={[
                  styles.navLabel,
                  activeTab === 'search' && styles.navLabelActive,
                ]}
              >
                Recherche
              </Text>
            </TouchableOpacity>

            {/* Tab 3: Paramètres (Settings icon) */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.navItem,
                activeTab === 'settings' && styles.navItemActive,
              ]}
              onPress={() => handleTabChange('settings')}
            >
              <Settings
                size={20}
                color={activeTab === 'settings' ? '#F4F5F8' : '#8E93A4'}
              />
              <Text
                style={[
                  styles.navLabel,
                  activeTab === 'settings' && styles.navLabelActive,
                ]}
              >
                Paramètres
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1C22',
  },
  content: {
    flex: 1,
    paddingBottom: 85,
  },
  floatingNavWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#252833',
    borderRadius: 9999,
    padding: 6,
    borderWidth: 1,
    borderColor: '#343846',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9999,
  },
  navItemActive: {
    backgroundColor: '#363A48',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E93A4',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#F4F5F8',
    fontWeight: '800',
  },
});
