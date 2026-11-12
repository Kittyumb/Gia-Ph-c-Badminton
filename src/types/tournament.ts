export interface Team {
  id: string;
  name: string;
  p1?: string;
  p2?: string;
}

export interface Match {
  id: string;
  court: number;
  slot: number;
  a: string;
  b: string;
  sa: number;
  sb: number;
  forfeit: '' | 'a' | 'b';
  final: boolean;
  referee?: string;
}

export interface KoGame {
  a: string;
  b: string;
  sa: number;
  sb: number;
  forfeit: '' | 'a' | 'b';
  final: boolean;
  referee?: string;
}

export interface Bracket {
  seeds: string[];
  games: {
    sf1: KoGame;
    sf2: KoGame;
    final: KoGame | null;
    third: KoGame | null;
  };
}

export interface StandingRow {
  id: string;
  name: string;
  index: number;
  played: number;
  scheduled: number;
  wins: number;
  losses: number;
  forfeits: number;
  bonus: number;
  pf: number;
  pa: number;
  diff: number;
  tieSig?: string;
  tieResolved?: boolean;
  tieRelevant?: boolean;
}

export interface TieGroup {
  sig: string;
  from: number;
  to: number;
  arr: StandingRow[];
}

export interface Awards {
  first: string;
  second: string;
  third: string;
  fourth: string;
}

export type StagePage =
  | 'outer'
  | 'outer-results'
  | 'semi'
  | 'semi-results'
  | 'final'
  | 'final-results'
  | 'summary'
  | 'settings';

export interface TournamentState {
  v: number;
  teams: Team[];
  courts: string[];
  matches: Match[];
  bracket: Bracket | null;
  tieOrder: Record<string, string[]>;
  tieConfirm: Record<string, boolean>;
  page: StagePage;
  court: number;
  activeMatchId: string;
  settingTab: 'teams' | 'courts' | 'data';
}
