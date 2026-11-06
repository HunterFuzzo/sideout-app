import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Competition, PouleDetails } from '../types';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SelectModal, SelectOption } from '../components/ui/SelectModal';
import { MatchCard } from '../components/MatchCard';
import {
  ChevronRight,
  Filter,
  Trophy,
  Calendar,
  X,
  ChevronDown,
} from 'lucide-react-native';

const SAISON_OPTIONS: SelectOption[] = [
  { label: '2026 / 2027 (En cours)', value: '2026/2027' },
  { label: '2025 / 2026', value: '2025/2026' },
  { label: '2024 / 2025', value: '2024/2025' },
];

const DIVISION_OPTIONS: SelectOption[] = [
  { label: 'Toutes les divisions', value: 'ALL' },
  { label: 'Pré-Nationale', value: 'PRE_NATIONALE' },
  { label: 'Régionale', value: 'REGIONALE' },
  { label: 'M18 (Moins de 18)', value: 'M18' },
  { label: 'M15 (Moins de 15)', value: 'M15' },
];

const GENRE_OPTIONS: SelectOption[] = [
  { label: 'Tous les genres', value: 'ALL' },
  { label: 'Masculin', value: 'MASCULIN' },
  { label: 'Féminin', value: 'FEMININ' },
];

const FORMAT_OPTIONS: SelectOption[] = [
  { label: 'Tous les formats', value: 'ALL' },
  { label: '6x6', value: '6x6' },
  { label: '4x4', value: '4x4' },
  { label: '2x2', value: '2x2' },
];

export const SearchScreen: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [saison, setSaison] = useState('2026/2027');
  const [division, setDivision] = useState('ALL');
  const [genre, setGenre] = useState('ALL');
  const [pouleFormat, setPouleFormat] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for filters
  const [activeFilterModal, setActiveFilterModal] = useState<
    'saison' | 'division' | 'genre' | 'format' | null
  >(null);

  // Selected competition details modal
  const [selectedPoule, setSelectedPoule] = useState<string | null>(null);
  const [pouleDetails, setPouleDetails] = useState<PouleDetails | null>(null);
  const [pouleLoading, setPouleLoading] = useState(false);
  const [modalTab, setModalTab] = useState<'ranking' | 'calendar'>('ranking');
  const [followedIds, setFollowedIds] = useState<string[]>([]);

  // Fetch competitions when season changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.getCompetitions(saison)
      .then((data) => {
        if (isMounted) {
          setCompetitions(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load competitions', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [saison]);

  // Fetch followed match IDs
  useEffect(() => {
    storage.getFollowedMatchIds().then(setFollowedIds);
  }, []);

  // Fetch poule details when selected
  useEffect(() => {
    if (!selectedPoule) {
      setPouleDetails(null);
      return;
    }

    setPouleLoading(true);
    setModalTab('ranking');
    api.getPouleDetails(selectedPoule, saison)
      .then((details) => {
        setPouleDetails(details);
        setPouleLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load poule details', err);
        setPouleLoading(false);
      });
  }, [selectedPoule, saison]);

  const handleToggleFollow = async (id: string) => {
    await storage.toggleFollowMatch(id);
    const updated = await storage.getFollowedMatchIds();
    setFollowedIds(updated);
  };

  // Filtered competitions
  const filteredCompetitions = useMemo(() => {
    return competitions.filter((comp) => {
      if (division !== 'ALL' && comp.division !== division) return false;
      if (genre !== 'ALL' && comp.genre !== genre) return false;
      if (pouleFormat !== 'ALL' && comp.pouleLabel !== pouleFormat) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim().replace(/^#/, '');
        const matchesName = comp.name?.toLowerCase().includes(q);
        const matchesPoule = comp.poule?.toLowerCase().includes(q);
        const matchesTeam = comp.teams?.some((t) => t.toLowerCase().includes(q));
        const matchesTag = comp.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesPoule && !matchesTeam && !matchesTag) return false;
      }
      return true;
    });
  }, [competitions, division, genre, pouleFormat, searchQuery]);

  const resetFilters = () => {
    setDivision('ALL');
    setGenre('ALL');
    setPouleFormat('ALL');
    setSearchQuery('');
  };

  const hasActiveFilters =
    division !== 'ALL' || genre !== 'ALL' || pouleFormat !== 'ALL' || searchQuery.trim().length > 0;

  return (
    <View style={styles.container}>
      {/* Title only */}
      <View style={{ marginBottom: 12 }}>
        <Text style={styles.title}>Recherche & Compétitions</Text>
      </View>

      {/* Search Bar */}
      <Input
        showSearchIcon
        placeholder="Rechercher par club, poule, tag (#m18)..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
        style={{ marginBottom: 8 }}
      />

      {/* Quick Tags Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagChipsRow}
      >
        {[
          { id: 'senior', label: 'Senior' },
          { id: 'm18', label: 'M18' },
          { id: 'm15', label: 'M15' },
          { id: 'm21', label: 'M21' },
          { id: 'prenationale', label: 'Pré-Nationale' },
          { id: 'regionale', label: 'Régionale' },
          { id: 'masculin', label: 'Masculin' },
          { id: 'feminin', label: 'Féminin' },
          { id: '6x6', label: '6x6' },
          { id: '4x4', label: '4x4' },
          { id: '2x2', label: '2x2' },
          { id: 'laurentin', label: 'Stade Laurentin' },
          { id: 'cannes', label: 'Cannes' },
          { id: 'nice', label: 'Nice' },
          { id: 'antibes', label: 'Antibes' },
          { id: 'monaco', label: 'Monaco' },
        ].map((tag) => {
          const isSelected = searchQuery.toLowerCase().includes(tag.id);
          return (
            <TouchableOpacity
              key={tag.id}
              activeOpacity={0.8}
              onPress={() => setSearchQuery(isSelected ? '' : tag.id)}
              style={[
                styles.tagChip,
                isSelected && styles.tagChipActive,
              ]}
            >
              <Text
                style={[
                  styles.tagChipText,
                  isSelected && styles.tagChipTextActive,
                ]}
              >
                {tag.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Horizontal Filter Chips Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipsRow}
      >
        {/* Saison */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.filterChip, styles.filterChipActive]}
          onPress={() => setActiveFilterModal('saison')}
        >
          <Text style={styles.filterChipLabelActive}>{saison}</Text>
          <ChevronDown size={14} color="#FF5E1E" style={{ marginLeft: 3 }} />
        </TouchableOpacity>

        {/* Division */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.filterChip, division !== 'ALL' && styles.filterChipActive]}
          onPress={() => setActiveFilterModal('division')}
        >
          <Text
            style={[
              styles.filterChipLabel,
              division !== 'ALL' && styles.filterChipLabelActive,
            ]}
          >
            {division === 'ALL'
              ? 'Division'
              : DIVISION_OPTIONS.find((o) => o.value === division)?.label}
          </Text>
          <ChevronDown
            size={14}
            color={division !== 'ALL' ? '#FF5E1E' : '#8C90A2'}
            style={{ marginLeft: 3 }}
          />
        </TouchableOpacity>

        {/* Genre */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.filterChip, genre !== 'ALL' && styles.filterChipActive]}
          onPress={() => setActiveFilterModal('genre')}
        >
          <Text
            style={[
              styles.filterChipLabel,
              genre !== 'ALL' && styles.filterChipLabelActive,
            ]}
          >
            {genre === 'ALL'
              ? 'Genre'
              : GENRE_OPTIONS.find((o) => o.value === genre)?.label}
          </Text>
          <ChevronDown
            size={14}
            color={genre !== 'ALL' ? '#FF5E1E' : '#8C90A2'}
            style={{ marginLeft: 3 }}
          />
        </TouchableOpacity>

        {/* Format */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.filterChip, pouleFormat !== 'ALL' && styles.filterChipActive]}
          onPress={() => setActiveFilterModal('format')}
        >
          <Text
            style={[
              styles.filterChipLabel,
              pouleFormat !== 'ALL' && styles.filterChipLabelActive,
            ]}
          >
            {pouleFormat === 'ALL' ? 'Format' : pouleFormat}
          </Text>
          <ChevronDown
            size={14}
            color={pouleFormat !== 'ALL' ? '#FF5E1E' : '#8C90A2'}
            style={{ marginLeft: 3 }}
          />
        </TouchableOpacity>

        {hasActiveFilters && (
          <TouchableOpacity
            onPress={resetFilters}
            style={styles.resetBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.resetBtnText}>Effacer</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Competitions List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#8E93A4" />
          <Text style={styles.loadingText}>Chargement des compétitions...</Text>
        </View>
      ) : filteredCompetitions.length > 0 ? (
        <FlatList
          data={filteredCompetitions}
          keyExtractor={(item) => item.poule}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedPoule(item.poule)}
            >
              <Card style={styles.compCard}>
                <View style={styles.compCardLeft}>
                  <View style={styles.compBadgeRow}>
                    <Badge variant="outline" style={styles.pouleBadge}>
                      {item.poule}
                    </Badge>
                    <Badge variant="secondary">
                      {item.division === 'M15' ? 'M15' : item.division === 'M18' ? 'M18' : 'Senior'}
                    </Badge>
                    <Badge variant={item.genre === 'FEMININ' ? 'secondary' : 'default'}>
                      {item.genre === 'FEMININ' ? 'Féminin' : 'Masculin'}
                    </Badge>
                    <Badge variant="secondary">
                      {item.division === 'PRE_NATIONALE' ? 'Pré-Nationale' : 'Régionale'}
                    </Badge>
                    {item.isBeach && (
                      <Badge variant="secondary">Beach</Badge>
                    )}
                    <Badge variant="secondary">
                      {item.tags?.includes('4x4') ? '4x4' : item.tags?.includes('2x2') ? '2x2' : '6x6'}
                    </Badge>
                    <Badge variant="secondary">
                      {item.pouleLabel}
                    </Badge>
                  </View>
                  <Text style={styles.compName} numberOfLines={2}>
                    {(item.name || '').replace(/^[A-Za-z0-9_]{2,8}\s+[-–—:]?\s*/i, '').replace(/^CHAMPIONNAT\s+/i, '').replace(/\s*[-–—]\s*/g, ' • ').trim()}
                  </Text>
                </View>

                <ChevronRight size={20} color="#8E93A4" />
              </Card>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        /* Minimal Empty State: NO cadre, text only */
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Aucun résultat</Text>
        </View>
      )}

      {/* Filter Modals */}
      <SelectModal
        visible={activeFilterModal === 'saison'}
        title="Sélectionner la saison"
        options={SAISON_OPTIONS}
        selectedValue={saison}
        onSelect={setSaison}
        onClose={() => setActiveFilterModal(null)}
      />
      <SelectModal
        visible={activeFilterModal === 'division'}
        title="Filtrer par division"
        options={DIVISION_OPTIONS}
        selectedValue={division}
        onSelect={setDivision}
        onClose={() => setActiveFilterModal(null)}
      />
      <SelectModal
        visible={activeFilterModal === 'genre'}
        title="Filtrer par genre"
        options={GENRE_OPTIONS}
        selectedValue={genre}
        onSelect={setGenre}
        onClose={() => setActiveFilterModal(null)}
      />
      <SelectModal
        visible={activeFilterModal === 'format'}
        title="Filtrer par format / poule"
        options={FORMAT_OPTIONS}
        selectedValue={pouleFormat}
        onSelect={setPouleFormat}
        onClose={() => setActiveFilterModal(null)}
      />

      {/* Poule Details Full Modal (Classement & Calendrier) */}
      <Modal
        visible={!!selectedPoule}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedPoule(null)}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              {pouleDetails && (
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4 }}>
                  <Badge variant="outline" style={{ borderColor: '#FF5E1E' }}>
                    {pouleDetails.competition.poule}
                  </Badge>
                  <Badge
                    variant={
                      pouleDetails.competition.genre === 'FEMININ'
                        ? 'secondary'
                        : 'default'
                    }
                  >
                    {pouleDetails.competition.genre === 'FEMININ'
                      ? 'Féminin'
                      : 'Masculin'}
                  </Badge>
                </View>
              )}
              <Text style={styles.modalTitle} numberOfLines={2}>
                {(pouleDetails?.competition.name || selectedPoule || '')
                  .replace(/^[A-Za-z0-9_]{2,8}\s+[-–—:]?\s*/i, '')
                  .replace(/^CHAMPIONNAT\s+/i, '')
                  .replace(/\s*[-–—]\s*/g, ' • ')
                  .trim()}
              </Text>
              <Text style={styles.modalSubtitle}>Saison {saison} • Ligue PACA</Text>
            </View>

            <TouchableOpacity
              onPress={() => setSelectedPoule(null)}
              style={styles.modalCloseBtn}
            >
              <X size={20} color="#8C90A2" />
            </TouchableOpacity>
          </View>

          {/* Modal Sub-tabs */}
          <View style={styles.modalTabs}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.modalTabBtn,
                modalTab === 'ranking' && styles.modalTabBtnActive,
              ]}
              onPress={() => setModalTab('ranking')}
            >
              <Trophy
                size={14}
                color={modalTab === 'ranking' ? '#fff' : '#8C90A2'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.modalTabBtnText,
                  modalTab === 'ranking' && styles.modalTabBtnTextActive,
                ]}
              >
                Classement
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.modalTabBtn,
                modalTab === 'calendar' && styles.modalTabBtnActive,
              ]}
              onPress={() => setModalTab('calendar')}
            >
              <Calendar
                size={14}
                color={modalTab === 'calendar' ? '#fff' : '#8C90A2'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.modalTabBtnText,
                  modalTab === 'calendar' && styles.modalTabBtnTextActive,
                ]}
              >
                Calendrier ({pouleDetails?.matches.length ?? 0})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          {pouleLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#FF5E1E" />
              <Text style={styles.loadingText}>Chargement des résultats...</Text>
            </View>
          ) : pouleDetails ? (
            modalTab === 'ranking' ? (
              /* Classement Table */
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
                <View style={styles.tableCard}>
                  {/* Table Header */}
                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.thCell, { width: 28, textAlign: 'center' }]}>#</Text>
                    <Text style={[styles.thCell, { flex: 1 }]}>Équipe</Text>
                    <Text style={[styles.thCell, styles.thPts]}>Pts</Text>
                    <Text style={[styles.thCell, styles.thNum]}>J.</Text>
                    <Text style={[styles.thCell, styles.thNum]}>G.</Text>
                    <Text style={[styles.thCell, styles.thNum]}>P.</Text>
                  </View>

                  {/* Table Body */}
                  {pouleDetails.ranking.map((row) => (
                    <View key={row.rank} style={styles.tableRow}>
                      <View style={[styles.rankCircle, row.rank === 1 && styles.rankCircleFirst]}>
                        <Text style={[styles.rankText, row.rank === 1 && styles.rankTextFirst]}>
                          {row.rank}
                        </Text>
                      </View>
                      <Text style={styles.teamCell} numberOfLines={1}>
                        {row.team}
                      </Text>
                      <Text style={styles.ptsCell}>{row.points}</Text>
                      <Text style={styles.numCell}>{row.played}</Text>
                      <Text style={[styles.numCell, { color: '#10B981' }]}>{row.won}</Text>
                      <Text style={[styles.numCell, { color: '#EF4444' }]}>{row.lost}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            ) : (
              /* Calendar Matches */
              <FlatList
                data={pouleDetails.matches}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <MatchCard
                    match={item}
                    isFollowed={followedIds.includes(item.id)}
                    onToggleFollow={handleToggleFollow}
                  />
                )}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
              />
            )
          ) : null}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F4F5F8',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#8C90A2',
    marginTop: 2,
  },
  filterChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121522',
    borderWidth: 1,
    borderColor: '#242A3D',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterChipActive: {
    borderColor: '#FF5E1E',
    backgroundColor: 'rgba(255, 94, 30, 0.12)',
  },
  filterChipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8C90A2',
  },
  filterChipLabelActive: {
    color: '#FF5E1E',
    fontWeight: '700',
  },
  resetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  resetBtnText: {
    color: '#FF5E1E',
    fontSize: 12,
    fontWeight: '700',
  },
  resultsInfoRow: {
    marginTop: 8,
    marginBottom: 6,
  },
  resultsCountText: {
    fontSize: 11,
    color: '#8C90A2',
    fontWeight: '600',
  },
  compCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginVertical: 4,
  },
  compCardLeft: {
    flex: 1,
    paddingRight: 10,
  },
  compBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  pouleBadge: {
    borderColor: 'rgba(255, 94, 30, 0.4)',
  },
  compFormatText: {
    fontSize: 11,
    color: '#8C90A2',
    fontWeight: '600',
    marginLeft: 2,
  },
  compName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F4F5F8',
    lineHeight: 18,
  },
  listContent: {
    paddingBottom: 24,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    fontSize: 13,
    color: '#8C90A2',
    marginTop: 10,
    fontWeight: '600',
  },
  tagChipsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
    marginBottom: 8,
  },
  tagChip: {
    backgroundColor: '#232630',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagChipActive: {
    backgroundColor: '#363A48',
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E93A4',
  },
  tagChipTextActive: {
    color: '#F4F5F8',
    fontWeight: '800',
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
    textAlign: 'center',
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#090A0F',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F30',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#F4F5F8',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#8C90A2',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    backgroundColor: '#181C2C',
    borderRadius: 16,
  },
  modalTabs: {
    flexDirection: 'row',
    backgroundColor: '#121522',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1F2436',
  },
  modalTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  modalTabBtnActive: {
    backgroundColor: '#FF5E1E',
  },
  modalTabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8C90A2',
  },
  modalTabBtnTextActive: {
    color: '#FFFFFF',
  },
  // Table
  tableCard: {
    backgroundColor: '#121522',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F2436',
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161A2B',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#242A3D',
  },
  thCell: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8C90A2',
  },
  thPts: {
    width: 34,
    textAlign: 'center',
    color: '#FF5E1E',
    fontWeight: '900',
  },
  thNum: {
    width: 26,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1E2F',
  },
  rankCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181C2C',
  },
  rankCircleFirst: {
    backgroundColor: 'rgba(255, 94, 30, 0.2)',
  },
  rankText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8C90A2',
    fontFamily: 'Courier',
  },
  rankTextFirst: {
    color: '#FF5E1E',
  },
  teamCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#F4F5F8',
    marginLeft: 8,
    marginRight: 6,
  },
  ptsCell: {
    width: 34,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '900',
    color: '#FF5E1E',
    fontFamily: 'Courier',
  },
  numCell: {
    width: 26,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: '#8C90A2',
    fontFamily: 'Courier',
  },
  setsCell: {
    width: 50,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    color: '#64697E',
    fontFamily: 'Courier',
  },
});
