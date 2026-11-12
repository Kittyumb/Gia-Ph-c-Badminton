import {
  Team,
  Match,
  KoGame,
  Bracket,
  StandingRow,
  TieGroup,
  Awards,
  TournamentState,
} from '../types/tournament';

export const STORAGE_KEY = 'gia-phuc-cup-2026-v2';

export const DEFAULT_PRIZES = {
  first: { title: 'GIẢI NHẤT', cash: '500.000đ', extra: 'Cúp Vàng + Huy chương Vàng' },
  second: { title: 'GIẢI NHÌ', cash: '300.000đ', extra: 'Huy chương Bạc' },
  third: { title: 'GIẢI BA', cash: '200.000đ', extra: 'Huy chương Đồng' },
  fourth: { title: 'HẠNG TƯ', cash: 'Danh dự', extra: 'Kỷ niệm chương' },
};

export const makeDefaultTeams = (): Team[] => [
  { id: 't1', name: 'Đội 01', p1: 'Nguyễn Văn An', p2: 'Trần Đình Bình' },
  { id: 't2', name: 'Đội 02', p1: 'Lê Hoàng Cường', p2: 'Phạm Minh Đức' },
  { id: 't3', name: 'Đội 03', p1: 'Vũ Quốc Hùng', p2: 'Đỗ Tuấn Khải' },
  { id: 't4', name: 'Đội 04', p1: 'Bùi Hải Long', p2: 'Đặng Quang Minh' },
  { id: 't5', name: 'Đội 05', p1: 'Ngô Thanh Nam', p2: 'Hồ Trọng Phát' },
  { id: 't6', name: 'Đội 06', p1: 'Dương Gia Phúc', p2: 'Lý Quốc Quân' },
  { id: 't7', name: 'Đội 07', p1: 'Phan Thành Sơn', p2: 'Tạ Minh Triết' },
  { id: 't8', name: 'Đội 08', p1: 'Võ Minh Vũ', p2: 'Trịnh Huy Xuân' },
];

export const createMatch = (
  id: number,
  court: number,
  slot: number,
  a: string,
  b: string
): Match => ({
  id: `m${id}`,
  court,
  slot,
  a,
  b,
  sa: 0,
  sb: 0,
  forfeit: '',
  final: false,
});

const keyPair = (a: string, b: string): string => [a, b].sort().join('~');

export function generateSchedule(teams: Team[]): Match[] {
  const ids = teams.map((t) => t.id);
  if (ids.length < 4) {
    throw new Error('Cần ít nhất 4 đội để tổ chức giải đấu trên 2 sân.');
  }

  // Optimized balanced 8-team 16-match schedule across 2 courts (4 matches per team)
  if (ids.length === 8) {
    const list: Match[] = [];
    let p = [...ids];
    for (let r = 0; r < 4; r++) {
      for (let k = 0; k < 4; k++) {
        const court = (k % 2) + 1;
        const slot = r * 2 + Math.floor(k / 2) + 1;
        const matchId = (slot - 1) * 2 + court;
        list.push(createMatch(matchId, court, slot, p[k], p[7 - k]));
      }
      p = [p[0], p[7], ...p.slice(1, 7)];
    }
    return list.sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));
  }

  // Heuristic generator for custom team counts
  const played = Object.fromEntries(ids.map((x) => [x, 0]));
  const freq: Record<string, number> = {};
  let previous = new Set<string>();
  const list: Match[] = [];

  for (let slot = 1; slot <= 8; slot++) {
    let bestOption: { a: number; b: number; c: number; d: number; cost: number } | null = null;
    for (let a = 0; a < ids.length; a++) {
      for (let b = a + 1; b < ids.length; b++) {
        for (let c = 0; c < ids.length; c++) {
          for (let d = c + 1; d < ids.length; d++) {
            const q = [a, b, c, d];
            if (new Set(q).size !== 4) continue;
            const ab = keyPair(ids[a], ids[b]);
            const cd = keyPair(ids[c], ids[d]);
            const cost =
              (freq[ab] || 0) * 80 +
              (freq[cd] || 0) * 80 +
              (played[ids[a]] + played[ids[b]] + played[ids[c]] + played[ids[d]]) * 15 +
              q.filter((x) => previous.has(ids[x])).length * 5 +
              q.reduce((v, x) => v + x, 0) / 100;

            if (!bestOption || cost < bestOption.cost) {
              bestOption = { a, b, c, d, cost };
            }
          }
        }
      }
    }

    if (!bestOption) {
      throw new Error('Không thể sắp xếp lịch thi đấu cân bằng cho số đội hiện tại.');
    }

    list.push(
      createMatch((slot - 1) * 2 + 1, 1, slot, ids[bestOption.a], ids[bestOption.b]),
      createMatch((slot - 1) * 2 + 2, 2, slot, ids[bestOption.c], ids[bestOption.d])
    );

    previous = new Set([
      ids[bestOption.a],
      ids[bestOption.b],
      ids[bestOption.c],
      ids[bestOption.d],
    ]);
    for (const q of previous) played[q]++;
    freq[keyPair(ids[bestOption.a], ids[bestOption.b])] =
      (freq[keyPair(ids[bestOption.a], ids[bestOption.b])] || 0) + 1;
    freq[keyPair(ids[bestOption.c], ids[bestOption.d])] =
      (freq[keyPair(ids[bestOption.c], ids[bestOption.d])] || 0) + 1;
  }

  return list;
}

export function determineWinner(
  match: Match | KoGame | null | undefined
): 'a' | 'b' | null {
  if (!match || !match.final) return null;
  if (match.forfeit === 'a') return 'b';
  if (match.forfeit === 'b') return 'a';
  if (match.sa > match.sb) return 'a';
  if (match.sb > match.sa) return 'b';
  return null;
}

export function calculateStandings(
  teams: Team[],
  matches: Match[],
  tieOrder: Record<string, string[]> = {},
  tieConfirm: Record<string, boolean> = {}
): StandingRow[] {
  const rows: StandingRow[] = teams.map((t, index) => ({
    id: t.id,
    name: t.name,
    index,
    played: 0,
    scheduled: 0,
    wins: 0,
    losses: 0,
    forfeits: 0,
    bonus: 0,
    pf: 0,
    pa: 0,
    diff: 0,
  }));

  const byId = Object.fromEntries(rows.map((x) => [x.id, x]));

  for (const m of matches) {
    const a = byId[m.a];
    const b = byId[m.b];
    if (!a || !b || a.id === b.id) continue;

    a.scheduled++;
    b.scheduled++;

    if (!m.final) continue;

    a.played++;
    b.played++;

    const w = determineWinner(m);
    if (w === 'a') {
      a.wins++;
      b.losses++;
      a.bonus += 2;
      b.bonus += m.forfeit ? 0 : 1;
    } else if (w === 'b') {
      b.wins++;
      a.losses++;
      b.bonus += 2;
      a.bonus += m.forfeit ? 0 : 1;
    }

    if (m.forfeit) {
      if (m.forfeit === 'a') a.forfeits++;
      if (m.forfeit === 'b') b.forfeits++;
    } else {
      a.pf += m.sa;
      a.pa += m.sb;
      b.pf += m.sb;
      b.pa += m.sa;
    }
  }

  rows.forEach((x) => {
    // Thể thức giải: Điểm đạt được dù thắng hay thua sẽ cộng dồn vô làm hiệu số
    x.diff = x.pf;
  });

  // Sort primarily by Bonus points DESC, then Diff DESC, then team initial index ASC
  rows.sort((a, b) => b.bonus - a.bonus || b.diff - a.diff || a.index - b.index);

  // Group ties where bonus AND diff are identical
  let at = 0;
  while (at < rows.length) {
    let j = at + 1;
    while (
      j < rows.length &&
      rows[j].bonus === rows[at].bonus &&
      rows[j].diff === rows[at].diff
    ) {
      j++;
    }

    if (j - at > 1) {
      const sig = rows
        .slice(at, j)
        .map((x) => x.id)
        .sort()
        .join('|');
      const order = tieOrder[sig];
      const isConfirmed = Boolean(tieConfirm[sig] && order?.length === j - at);

      if (order?.length === j - at && rows.slice(at, j).every((x) => order.includes(x.id))) {
        rows.splice(
          at,
          j - at,
          ...rows.slice(at, j).sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
        );
      }

      for (let k = at; k < j; k++) {
        rows[k].tieSig = sig;
        rows[k].tieResolved = isConfirmed;
        rows[k].tieRelevant = at < 4;
      }
    }
    at = j;
  }

  return rows;
}

export function getTieGroups(rows: StandingRow[]): TieGroup[] {
  const groups: TieGroup[] = [];
  for (let i = 0; i < rows.length; ) {
    let j = i + 1;
    while (
      j < rows.length &&
      rows[i].bonus === rows[j].bonus &&
      rows[i].diff === rows[j].diff
    ) {
      j++;
    }
    if (j - i > 1 && i < 4) {
      const arr = rows.slice(i, j);
      const sig = arr[0].tieSig || arr.map((x) => x.id).sort().join('|');
      groups.push({ arr, sig, from: i, to: j });
    }
    i = j;
  }
  return groups;
}

export function createKnockoutGame(a: string, b: string): KoGame {
  return {
    a,
    b,
    sa: 0,
    sb: 0,
    forfeit: '',
    final: false,
  };
}

export function syncKnockoutBracket(bracket: Bracket | null): void {
  if (!bracket) return;
  const { sf1, sf2 } = bracket.games;

  if (sf1?.final && sf2?.final) {
    const w1 = determineWinner(sf1);
    const w2 = determineWinner(sf2);

    if (w1 && w2) {
      const finalA = sf1[w1];
      const finalB = sf2[w2];
      const thirdA = sf1[w1 === 'a' ? 'b' : 'a'];
      const thirdB = sf2[w2 === 'a' ? 'b' : 'a'];

      if (
        !bracket.games.final ||
        bracket.games.final.a !== finalA ||
        bracket.games.final.b !== finalB
      ) {
        bracket.games.final = createKnockoutGame(finalA, finalB);
      }

      if (
        !bracket.games.third ||
        bracket.games.third.a !== thirdA ||
        bracket.games.third.b !== thirdB
      ) {
        bracket.games.third = createKnockoutGame(thirdA, thirdB);
      }
      return;
    }
  }

  bracket.games.final = null;
  bracket.games.third = null;
}

export function getAwards(bracket: Bracket | null): Awards | null {
  const games = bracket?.games;
  if (!games?.final?.final || !games?.third?.final) return null;

  const wFinal = determineWinner(games.final);
  const wThird = determineWinner(games.third);

  if (!wFinal || !wThird) return null;

  return {
    first: games.final[wFinal],
    second: games.final[wFinal === 'a' ? 'b' : 'a'],
    third: games.third[wThird],
    fourth: games.third[wThird === 'a' ? 'b' : 'a'],
  };
}

export function createFreshTournament(): TournamentState {
  const teams = makeDefaultTeams();
  return {
    v: 2,
    teams,
    courts: ['Sân 1', 'Sân 2'],
    matches: generateSchedule(teams),
    bracket: null,
    tieOrder: {},
    tieConfirm: {},
    page: 'outer',
    court: 1,
    activeMatchId: 'm1',
    settingTab: 'teams',
  };
}

export function loadTournamentState(): TournamentState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createFreshTournament();
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      parsed.v === 2 &&
      Array.isArray(parsed.teams) &&
      parsed.teams.length >= 4 &&
      Array.isArray(parsed.matches) &&
      parsed.matches.length >= 8
    ) {
      return {
        ...createFreshTournament(),
        ...parsed,
        tieOrder: parsed.tieOrder || {},
        tieConfirm: parsed.tieConfirm || {},
        courts: parsed.courts?.length === 2 ? parsed.courts : ['Sân 1', 'Sân 2'],
      };
    }
  } catch (err) {
    console.error('Failed to parse saved tournament data:', err);
  }
  return createFreshTournament();
}

export function saveTournamentState(state: TournamentState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.error('Failed to save tournament state to localStorage:', err);
    return false;
  }
}

export function exportTournamentCsv(state: TournamentState): string {
  const teamMap = Object.fromEntries(state.teams.map((t) => [t.id, t.name]));
  const getTeamName = (id?: string) => (id ? teamMap[id] || '— Chưa rõ —' : '—');
  const getCourtName = (n: number) => state.courts[n - 1] || `Sân ${n}`;

  const standings = calculateStandings(
    state.teams,
    state.matches,
    state.tieOrder,
    state.tieConfirm
  );

  const rows: (string | number)[][] = [
    ['GIẢI CẦU LÔNG TRANH CÚP GIA PHÚC 2026 — LẦN I'],
    ['Thời gian: 20:00 - 12/11/2026 | Địa điểm: Sân cầu lông Gia Phúc'],
    [],
    ['BẢNG XẾP HẠNG VÒNG NGOÀI'],
    [
      'Hạng',
      'Đội',
      'Trận đã đấu',
      'Thắng',
      'Thua',
      'Bỏ cuộc',
      'Điểm thưởng',
      'Điểm ghi (PF)',
      'Điểm thua (PA)',
      'Hiệu số',
      'Ghi chú',
    ],
  ];

  standings.forEach((row, i) => {
    rows.push([
      i + 1,
      row.name,
      row.played,
      row.wins,
      row.losses,
      row.forfeits,
      row.bonus,
      row.pf,
      row.pa,
      row.diff > 0 ? `+${row.diff}` : row.diff,
      i < 4 ? 'Vào Bán kết (TOP 4)' : '',
    ]);
  });

  rows.push([], ['LỊCH THI ĐẤU VÀ KẾT QUẢ VÒNG NGOÀI (16 TRẬN)']);
  rows.push([
    'Mã trận',
    'Sân',
    'Lượt',
    'Đội A',
    'Đội B',
    'Tỷ số A',
    'Tỷ số B',
    'Trạng thái',
    'Đội thắng',
    'Trọng tài',
  ]);

  state.matches
    .slice()
    .sort((a, b) => a.court - b.court || a.slot - b.slot)
    .forEach((m) => {
      const winner = determineWinner(m);
      rows.push([
        m.id.toUpperCase(),
        getCourtName(m.court),
        `Lượt ${m.slot}`,
        getTeamName(m.a),
        getTeamName(m.b),
        m.forfeit ? '' : m.sa,
        m.forfeit ? '' : m.sb,
        m.forfeit ? `Đội ${m.forfeit.toUpperCase()} bỏ cuộc` : m.final ? 'Đã chốt' : 'Chưa đấu',
        winner ? getTeamName(m[winner]) : '—',
        m.referee || '—',
      ]);
    });

  if (state.bracket) {
    rows.push([], ['VÒNG LOẠI TRỰC TIẾP (KNOCKOUT)']);
    rows.push(['Vòng', 'Đội A', 'Đội B', 'Điểm A', 'Điểm B', 'Trạng thái', 'Đội thắng']);

    const games = [
      { key: 'sf1', label: 'Bán kết 1 (Hạt giống 1 vs 4)', g: state.bracket.games.sf1 },
      { key: 'sf2', label: 'Bán kết 2 (Hạt giống 2 vs 3)', g: state.bracket.games.sf2 },
      { key: 'final', label: 'Chung kết (Tranh Hạng 1 & 2)', g: state.bracket.games.final },
      { key: 'third', label: 'Tranh Hạng Ba (Hạng 3 & 4)', g: state.bracket.games.third },
    ];

    games.forEach(({ label, g }) => {
      if (!g) return;
      const winner = determineWinner(g);
      rows.push([
        label,
        getTeamName(g.a),
        getTeamName(g.b),
        g.forfeit ? '' : g.sa,
        g.forfeit ? '' : g.sb,
        g.forfeit ? 'Bỏ cuộc' : g.final ? 'Đã chốt' : 'Chờ đấu',
        winner ? getTeamName(g[winner]) : '—',
      ]);
    });
  }

  const awards = getAwards(state.bracket);
  if (awards) {
    rows.push([], ['KẾT QUẢ TRAO GIẢI CHUNG CUỘC']);
    rows.push([
      'Giải Nhất (Vô địch)',
      getTeamName(awards.first),
      DEFAULT_PRIZES.first.cash,
      DEFAULT_PRIZES.first.extra,
    ]);
    rows.push([
      'Giải Nhì (Á quân)',
      getTeamName(awards.second),
      DEFAULT_PRIZES.second.cash,
      DEFAULT_PRIZES.second.extra,
    ]);
    rows.push([
      'Giải Ba (Hạng 3)',
      getTeamName(awards.third),
      DEFAULT_PRIZES.third.cash,
      DEFAULT_PRIZES.third.extra,
    ]);
    rows.push([
      'Hạng Tư (Hạng 4)',
      getTeamName(awards.fourth),
      DEFAULT_PRIZES.fourth.cash,
      DEFAULT_PRIZES.fourth.extra,
    ]);
  }

  return (
    '\ufeff' +
    rows
      .map((row) =>
        row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
      )
      .join('\r\n')
  );
}

export function downloadFile(filename: string, mime: string, content: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
