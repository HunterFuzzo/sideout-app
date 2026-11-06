import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { storage } from '../services/storage';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Separator } from '../components/ui/Separator';
import {
  Heart,
  Bell,
  Trash2,
  ShieldCheck,
  Check,
} from 'lucide-react-native';

const PACA_CLUBS = [
  'VOLLEY-BALL STADE LAURENTIN',
  'AS CANNES VOLLEY-BALL',
  'NICE VOLLEY-BALL',
  'OAJLP VOLLEY-BALL ANTIBES',
  'AS MONACO VOLLEY-BALL',
  'PAYS D\'AIX VENELLES VB',
  'TOULON SIX-FOURS VB',
  'MANDELIEU LA NAPOULE VB',
  'MARSEILLE VOLLEY 13',
  'GRASSE VOLLEY-BALL',
  'VILLENEUVE LOUBET VB',
  'US DE CAGNES VB',
];

export const SettingsScreen: React.FC = () => {
  const [favoriteClub, setFavoriteClub] = useState('');
  const [resultsNotif, setResultsNotif] = useState(true);
  const [reminderNotif, setReminderNotif] = useState(true);
  const [followedCount, setFollowedCount] = useState(0);

  useEffect(() => {
    storage.getFollowedMatchIds().then((ids) => setFollowedCount(ids.length));
  }, []);

  const handleClearFollowed = () => {
    Alert.alert(
      'Réinitialiser les favoris',
      'Voulez-vous vraiment effacer tous les matchs suivis ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await storage.clearFollowed();
            setFollowedCount(0);
          },
        },
      ]
    );
  };

  const handleTestNotification = () => {
    Alert.alert(
      '🏐 SideOut - Rappel avant-match',
      'Rappel J-1 : Stade Laurentin vs Nice VB demain à 20h00 !',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title only */}
      <View style={{ marginBottom: 14 }}>
        <Text style={styles.title}>Paramètres</Text>
      </View>

      {/* 1. Mon Club Favori */}
      <Card style={styles.card}>
        <CardHeader>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Heart size={16} color="#F4F5F8" />
              <CardTitle>Mon Club</CardTitle>
            </View>
          </View>
          <CardDescription>
            Sélectionnez votre club pour suivre ses scores en priorité
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {PACA_CLUBS.map((club) => {
                const isSelected = favoriteClub === club;
                const shortName = club.replace('VOLLEY-BALL ', '').replace(' VB', '');
                return (
                  <TouchableOpacity
                    key={club}
                    activeOpacity={0.8}
                    onPress={() => setFavoriteClub(isSelected ? '' : club)}
                    style={[
                      styles.clubChip,
                      isSelected && styles.clubChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.clubChipText,
                        isSelected && styles.clubChipTextActive,
                      ]}
                    >
                      {shortName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {favoriteClub ? (
            <View style={styles.activeClubRow}>
              <Text style={styles.activeClubLabel}>Club sélectionné :</Text>
              <Badge variant="secondary">
                <Text style={{ color: '#F4F5F8', fontWeight: '700', fontSize: 11 }}>
                  {favoriteClub}
                </Text>
              </Badge>
            </View>
          ) : null}
        </CardContent>
      </Card>

      {/* 2. Notifications Section */}
      <Card style={styles.card}>
        <CardHeader>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Bell size={16} color="#F4F5F8" />
              <CardTitle>Notifications</CardTitle>
            </View>
          </View>
          <CardDescription>
            Alertes des résultats et programmation des rappels
          </CardDescription>
        </CardHeader>

        <CardContent style={{ gap: 14 }}>
          {/* Toggle 1: Résultats */}
          <View style={styles.notifRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.notifTitle}>Résultats des matchs suivis</Text>
              <Text style={styles.notifDesc}>
                Notification instantanée dès que le score final officiel est publié
              </Text>
            </View>
            <Switch
              value={resultsNotif}
              onValueChange={setResultsNotif}
              trackColor={{ false: '#262934', true: '#3D4457' }}
              thumbColor={resultsNotif ? '#F4F5F8' : '#8E93A4'}
            />
          </View>

          <Separator style={{ backgroundColor: '#2C303E' }} />

          {/* Toggle 2 / Checkbox: Rappels J-7, J-3, J-1 */}
          <View style={styles.notifRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.notifTitle}>Rappels avant-match (J-7, J-3, J-1)</Text>
              <Text style={styles.notifDesc}>
                Alerte 1 semaine avant, puis 3 jours, puis 1 jour avant le coup d'envoi
              </Text>
            </View>
            <Switch
              value={reminderNotif}
              onValueChange={setReminderNotif}
              trackColor={{ false: '#262934', true: '#3D4457' }}
              thumbColor={reminderNotif ? '#F4F5F8' : '#8E93A4'}
            />
          </View>

          <Button
            size="sm"
            onPress={handleTestNotification}
            style={styles.testBtn}
          >
            <Text style={{ color: '#F4F5F8', fontWeight: '700', fontSize: 12 }}>
              Tester les notifications
            </Text>
          </Button>
        </CardContent>
      </Card>

      {/* 3. Données & Cache */}
      <Card style={styles.card}>
        <CardContent style={styles.dataRow}>
          <View>
            <Text style={styles.notifTitle}>Matchs suivis</Text>
            <Text style={styles.notifDesc}>
              {followedCount} match{followedCount > 1 ? 's' : ''} en mémoire
            </Text>
          </View>
          <Button
            size="sm"
            onPress={handleClearFollowed}
            disabled={followedCount === 0}
            style={styles.deleteBtn}
          >
            <Trash2 size={13} color="#F4F5F8" style={{ marginRight: 4 }} />
            <Text style={{ color: '#F4F5F8', fontWeight: '700', fontSize: 12 }}>
              Vider
            </Text>
          </Button>
        </CardContent>
      </Card>

      {/* 4. Mentions de sécurité */}
      <View style={styles.footerNote}>
        <ShieldCheck size={14} color="#8E93A4" style={{ marginRight: 6 }} />
        <Text style={styles.footerText}>
          SideOut PACA • Données certifiées FFVB Indoor
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1C22',
  },
  content: {
    padding: 16,
    paddingBottom: 95,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F4F5F8',
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: '#232630',
    borderRadius: 20,
    borderWidth: 0,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clubChip: {
    backgroundColor: '#1B1D24',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  clubChipActive: {
    backgroundColor: '#363A48',
  },
  clubChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E93A4',
  },
  clubChipTextActive: {
    color: '#F4F5F8',
    fontWeight: '800',
  },
  activeClubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  activeClubLabel: {
    fontSize: 12,
    color: '#8E93A4',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F4F5F8',
    marginBottom: 2,
  },
  notifDesc: {
    fontSize: 11,
    color: '#8E93A4',
    lineHeight: 16,
  },
  testBtn: {
    backgroundColor: '#2B2F3D',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  deleteBtn: {
    backgroundColor: '#2B2F3D',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  footerText: {
    fontSize: 11,
    color: '#8E93A4',
  },
});
