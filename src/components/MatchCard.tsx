import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Match } from '../types';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Separator } from './ui/Separator';
import { Calendar, Clock, Star, MapPin } from 'lucide-react-native';

interface MatchCardProps {
  match: Match;
  isFollowed?: boolean;
  onToggleFollow?: (matchId: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  isFollowed = false,
  onToggleFollow,
}) => {
  const isFinished = match.status === 'FINISHED';
  const homeWon = isFinished && (match.scoreHome ?? 0) > (match.scoreAway ?? 0);
  const awayWon = isFinished && (match.scoreAway ?? 0) > (match.scoreHome ?? 0);

  return (
    <Card style={styles.card}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Badge variant="outline" style={styles.idBadge} textStyle={styles.idText}>
            {match.id}
          </Badge>
          <Text style={styles.roundText} numberOfLines={1}>
            {match.round || match.poule}
          </Text>
        </View>

        <View style={styles.topBarRight}>
          <View style={styles.dateTimeBox}>
            <Calendar size={12} color="#8C90A2" />
            <Text style={styles.dateTimeText}>{match.date}</Text>
            <Clock size={12} color="#8C90A2" style={{ marginLeft: 4 }} />
            <Text style={styles.dateTimeText}>{match.time}</Text>
          </View>
        </View>
      </View>

      <CardContent style={styles.content}>
        {/* Teams and Main Score */}
        <View style={styles.teamsRow}>
          {/* Home Team */}
          <View style={styles.teamColumnLeft}>
            <View style={styles.teamNameRow}>
              <Text
                style={[styles.teamName, homeWon && styles.teamNameWon]}
                numberOfLines={2}
              >
                {match.homeTeam}
              </Text>
            </View>
            <Text style={styles.teamLabel}>DOMICILE</Text>
          </View>

          {/* Sets Score or Badge */}
          <View style={styles.scoreContainer}>
            {isFinished ? (
              <View style={styles.scorePill}>
                <Text style={[styles.scoreNum, homeWon && styles.scoreWon]}>
                  {match.scoreHome ?? 0}
                </Text>
                <Text style={styles.scoreDash}>-</Text>
                <Text style={[styles.scoreNum, awayWon && styles.scoreWon]}>
                  {match.scoreAway ?? 0}
                </Text>
              </View>
            ) : (
              <Badge variant="outline" style={styles.upcomingBadge}>
                À VENIR
              </Badge>
            )}
          </View>

          {/* Away Team */}
          <View style={styles.teamColumnRight}>
            <View style={[styles.teamNameRow, { justifyContent: 'flex-end' }]}>
              <Text
                style={[styles.teamName, { textAlign: 'right' }, awayWon && styles.teamNameWon]}
                numberOfLines={2}
              >
                {match.awayTeam}
              </Text>
            </View>
            <Text style={[styles.teamLabel, { textAlign: 'right' }]}>EXTÉRIEUR</Text>
          </View>
        </View>

        {/* Finished: Detailed Set breakdown */}
        {isFinished && match.setScores && match.setScores.length > 0 && (
          <View style={styles.setsWrapper}>
            <Separator style={{ marginVertical: 10 }} />
            <View style={styles.setsRow}>
              {match.setScores.map((set, idx) => (
                <View key={idx} style={styles.setPill}>
                  <Text style={styles.setText}>{set}</Text>
                </View>
              ))}
              {match.totalPoints && (
                <Text style={styles.totalPts}>({match.totalPoints} pts)</Text>
              )}
            </View>
          </View>
        )}

        {/* Upcoming: Gymnasium */}
        {!isFinished && match.venue && (
          <View style={styles.upcomingInfoWrapper}>
            <Separator style={{ marginVertical: 10 }} />
            <View style={styles.infoLine}>
              <MapPin size={13} color="#00D4FF" />
              <Text style={styles.infoText} numberOfLines={1}>
                {match.venue}
              </Text>
            </View>
          </View>
        )}
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 5,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0E111A',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F30',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  idBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderColor: 'rgba(255, 94, 30, 0.4)',
  },
  idText: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: '#D4D4D8',
  },
  roundText: {
    fontSize: 11,
    color: '#8C90A2',
    fontWeight: '600',
    maxWidth: 120,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 11,
    color: '#8C90A2',
    fontWeight: '500',
    marginLeft: 3,
  },
  starBtn: {
    padding: 3,
  },
  content: {
    paddingTop: 12,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamColumnLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  teamColumnRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  teamNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F4F5F8',
    lineHeight: 18,
  },
  teamNameWon: {
    color: '#F4F5F8',
  },
  teamLabel: {
    fontSize: 9,
    color: '#64697E',
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  scoreContainer: {
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181C2C',
    borderWidth: 1,
    borderColor: '#262D42',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scoreNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#8C90A2',
    fontFamily: 'Courier',
  },
  scoreWon: {
    color: '#F4F5F8',
  },
  scoreDash: {
    fontSize: 12,
    color: '#64697E',
    marginHorizontal: 5,
  },
  upcomingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  setsWrapper: {
    width: '100%',
  },
  setsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  setPill: {
    backgroundColor: '#181C2C',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#242A3D',
  },
  setText: {
    fontFamily: 'Courier',
    fontSize: 10,
    fontWeight: '700',
    color: '#8C90A2',
  },
  totalPts: {
    fontFamily: 'Courier',
    fontSize: 10,
    color: '#64697E',
    marginLeft: 4,
  },
  upcomingInfoWrapper: {
    width: '100%',
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 11,
    color: '#8C90A2',
    fontWeight: '500',
    flex: 1,
  },
});
