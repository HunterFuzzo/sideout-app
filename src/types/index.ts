export type DivisionCategory =
  | 'PRO'
  | 'ELITE'
  | 'NATIONALE'
  | 'PRE_NATIONALE'
  | 'REGIONALE'
  | 'DEPARTEMENTALE'
  | 'M21'
  | 'M18'
  | 'M15'
  | 'M13'
  | 'M11'
  | 'LOISIR'
  | 'AUTRE';

export type Gender = 'MASCULIN' | 'FEMININ' | 'MIXTE';
export type MatchStatus = 'UPCOMING' | 'FINISHED';

export interface Competition {
  poule: string;
  name: string;
  division: DivisionCategory;
  genre: Gender;
  pouleLabel: string;
  saison: string;
  codent: string;
  level?: 'PRO' | 'NATIONAL' | 'REGIONAL' | 'DEPARTEMENTAL';
  isBeach?: boolean;
  teams?: string[];
  tags?: string[];
}

export interface RankingRow {
  rank: number;
  team: string;
  points: number;
  played: number;
  won: number;
  lost: number;
  forfeits: number;
  threeZero: number;
  threeOne: number;
  threeTwo: number;
  twoThree: number;
  oneThree: number;
  zeroThree: number;
  setsWon: number;
  setsLost: number;
  setsRatio: number;
  pointsWon: number;
  pointsLost: number;
  pointsRatio: number;
}

export interface Match {
  id: string;
  poule: string;
  round: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  status: MatchStatus;
  scoreHome?: number;
  scoreAway?: number;
  setScores?: string[];
  totalPoints?: string;
  venue?: string;
  referee?: string;
}

export interface PouleDetails {
  competition: Competition;
  ranking: RankingRow[];
  matches: Match[];
  lastUpdated: string;
}
