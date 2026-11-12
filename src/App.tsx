import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  TournamentState,
  StagePage,
  Team,
  Match,
} from './types/tournament';
import {
  loadTournamentState,
  saveTournamentState,
  calculateStandings,
  getTieGroups,
  generateSchedule,
  createKnockoutGame,
  syncKnockoutBracket,
  exportTournamentCsv,
  downloadFile,
  createFreshTournament,
  determineWinner,
} from './lib/tournament';
import {
  auth,
  loginWithGoogle,
  logoutUser,
  testConnection,
  saveTournamentToFirestore,
  subscribeToTournament,
} from './lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { Header } from './components/Header';
import { StageNav } from './components/StageNav';
import { ScoreCard } from './components/ScoreCard';
import { MatchList } from './components/MatchList';
import { StandingsTable } from './components/StandingsTable';
import { KnockoutStage } from './components/KnockoutStage';
import { AwardsPodium } from './components/AwardsPodium';
import { SettingsModal } from './components/SettingsModal';
import { PrintSheet } from './components/PrintSheet';
import { ConfirmModal } from './components/ConfirmModal';
import { RefereeModal } from './components/RefereeModal';
import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface ModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  action: () => void;
}

export default function App() {
  const [state, setState] = useState<TournamentState>(() => loadTournamentState());
  const [savedTime, setSavedTime] = useState<string>('Vừa xong');
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(() => auth.currentUser);
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'syncing' | 'offline' | 'error'>('connected');
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user?.email) {
        setLastUpdatedBy(user.email);
      }
    });
    return () => unsubAuth();
  }, []);

  const [toastMessage, setToastMessage] = useState<{ text: string; bad?: boolean } | null>(null);
  const [selectedMatchForScoring, setSelectedMatchForScoring] = useState<string | null>(null);
  const [refereePromptMatchId, setRefereePromptMatchId] = useState<string | null>(null);
  const [lastRefereeName, setLastRefereeName] = useState<string>('');
  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  });

  const isRemoteUpdateRef = useRef(false);
  const initialSyncAttempted = useRef(false);

  const showToast = useCallback((text: string, bad = false) => {
    setToastMessage({ text, bad });
    setTimeout(() => {
      setToastMessage((current) => (current?.text === text ? null : current));
    }, 3200);
  }, []);

  const openConfirm = useCallback((config: Omit<ModalConfig, 'isOpen'>) => {
    setModal({ ...config, isOpen: true });
  }, []);

  const closeConfirm = useCallback(() => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // 1. Validate connection on boot & Subscribe to real-time Firestore database
  useEffect(() => {
    testConnection().then((connected) => {
      if (!connected) setCloudStatus('offline');
    });

    const unsubscribe = subscribeToTournament(
      (remoteData, updatedAt, updatedBy) => {
        setCloudStatus('connected');
        if (updatedAt) {
          const d = new Date(updatedAt);
          setSavedTime(
            `${d.getHours().toString().padStart(2, '0')}:${d
              .getMinutes()
              .toString()
              .padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
          );
        }
        if (updatedBy) {
          setLastUpdatedBy(updatedBy);
        }

        setState((prev) => {
          if (!remoteData.matches || !remoteData.teams) {
            // Document was just created or empty, seed local state up to Firestore
            if (!initialSyncAttempted.current) {
              initialSyncAttempted.current = true;
              saveTournamentToFirestore(prev, 'Ban tổ chức').catch(console.warn);
            }
            return prev;
          }

          const hasMeaningfulChanges =
            JSON.stringify(prev.matches) !== JSON.stringify(remoteData.matches) ||
            JSON.stringify(prev.teams) !== JSON.stringify(remoteData.teams) ||
            JSON.stringify(prev.bracket) !== JSON.stringify(remoteData.bracket) ||
            JSON.stringify(prev.courts) !== JSON.stringify(remoteData.courts) ||
            JSON.stringify(prev.tieOrder) !== JSON.stringify(remoteData.tieOrder) ||
            JSON.stringify(prev.tieConfirm) !== JSON.stringify(remoteData.tieConfirm);

          if (!hasMeaningfulChanges) return prev;

          isRemoteUpdateRef.current = true;
          return {
            ...prev,
            teams: remoteData.teams || prev.teams,
            courts: remoteData.courts || prev.courts,
            matches: remoteData.matches || prev.matches,
            bracket: remoteData.bracket !== undefined ? remoteData.bracket : prev.bracket,
            tieOrder: remoteData.tieOrder || prev.tieOrder,
            tieConfirm: remoteData.tieConfirm || prev.tieConfirm,
            court: remoteData.court || prev.court,
            activeMatchId: remoteData.activeMatchId || prev.activeMatchId,
          };
        });
      },
      (err) => {
        console.warn('Real-time subscription notice:', err);
        setCloudStatus('offline');
        let msg = err.message || 'Mất kết nối với cơ sở dữ liệu đám mây.';
        try {
          const parsed = JSON.parse(msg);
          if (parsed.error) msg = parsed.error;
        } catch {}
        setDbError(msg);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Save to localStorage & Cloud Firestore on state changes
  useEffect(() => {
    // Save to local cache first
    saveTournamentState(state);

    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    setCloudStatus('syncing');
    const timer = setTimeout(async () => {
      try {
        await saveTournamentToFirestore(state, 'Ban tổ chức');
        setCloudStatus('connected');
        setDbError(null);
        const now = new Date();
        setSavedTime(
          `${now.getHours().toString().padStart(2, '0')}:${now
            .getMinutes()
            .toString()
            .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
        );
      } catch (err: any) {
        console.warn('Sync to Firestore deferred:', err);
        setCloudStatus('offline');
        let msg = err.message || 'Lỗi lưu dữ liệu lên máy chủ.';
        try {
          const parsed = JSON.parse(msg);
          if (parsed.error) msg = parsed.error;
        } catch {}
        setDbError(msg);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [state]);

  // Manual immediate cloud push
  const handleSyncNow = useCallback(async () => {
    setCloudStatus('syncing');
    try {
      await saveTournamentToFirestore(state, 'Ban tổ chức');
      setCloudStatus('connected');
      setDbError(null);
      const now = new Date();
      setSavedTime(
        `${now.getHours().toString().padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      );
      showToast('✓ Đã đồng bộ dữ liệu trực tiếp lên Cloud Firestore!');
    } catch (err: any) {
      setCloudStatus('offline');
      let msg = err.message || 'Lỗi mạng';
      try {
        const parsed = JSON.parse(msg);
        if (parsed.error) msg = parsed.error;
      } catch {}
      setDbError(msg);
      showToast(`Không thể đồng bộ: ${msg}`, true);
    }
  }, [state, showToast]);

  const teamsMap = useMemo(() => {
    return Object.fromEntries(state.teams.map((t) => [t.id, t]));
  }, [state.teams]);

  const standings = useMemo(() => {
    return calculateStandings(
      state.teams,
      state.matches,
      state.tieOrder,
      state.tieConfirm
    );
  }, [state.teams, state.matches, state.tieOrder, state.tieConfirm]);

  const allOuterFinished = useMemo(() => {
    return state.matches.length > 0 && state.matches.every((m) => m.final);
  }, [state.matches]);

  const tieGroups = useMemo(() => {
    return allOuterFinished ? getTieGroups(standings) : [];
  }, [allOuterFinished, standings]);

  const activeMatch = useMemo(() => {
    if (selectedMatchForScoring) {
      const match = state.matches.find((m) => m.id === selectedMatchForScoring);
      if (match) return match;
    }
    return (
      state.matches.find((m) => m.id === state.activeMatchId) ||
      state.matches.find((m) => m.court === state.court) ||
      state.matches[0]
    );
  }, [state.matches, selectedMatchForScoring, state.activeMatchId, state.court]);

  // Execute outer match update safely
  const executeOuterUpdate = useCallback(
    (updater: (prev: TournamentState) => TournamentState) => {
      if (state.bracket) {
        openConfirm({
          title: 'Sửa đổi kết quả Vòng ngoài',
          message:
            'Sửa đổi vòng ngoài sẽ đặt lại nhánh Bán kết và Chung kết hiện tại để đảm bảo tính công bằng. Bạn có muốn tiếp tục?',
          confirmLabel: 'Đồng ý & Đặt lại nhánh',
          isDanger: true,
          action: () => {
            setState((prev) => {
              const next = updater(prev);
              return {
                ...next,
                bracket: null,
                tieOrder: {},
                tieConfirm: {},
              };
            });
            closeConfirm();
          },
        });
      } else {
        setState(updater);
      }
    },
    [state.bracket, openConfirm, closeConfirm]
  );

  // Handlers for Outer Round scoring
  const handleScoreChange = useCallback(
    (side: 'a' | 'b', value: number) => {
      executeOuterUpdate((prev) => ({
        ...prev,
        matches: prev.matches.map((m) =>
          m.id === activeMatch.id ? { ...m, [side === 'a' ? 'sa' : 'sb']: value } : m
        ),
      }));
    },
    [activeMatch.id, executeOuterUpdate]
  );

  const handleForfeitChange = useCallback(
    (forfeit: '' | 'a' | 'b') => {
      executeOuterUpdate((prev) => ({
        ...prev,
        matches: prev.matches.map((m) =>
          m.id === activeMatch.id
            ? {
                ...m,
                forfeit,
                sa: forfeit ? 0 : m.sa,
                sb: forfeit ? 0 : m.sb,
              }
            : m
        ),
      }));
    },
    [activeMatch.id, executeOuterUpdate]
  );

  const handleFinalizeOuterMatch = useCallback(
    (matchId: string) => {
      const match = state.matches.find((m) => m.id === matchId);
      if (!match) return;
      if (!match.a || !match.b || match.a === match.b) {
        showToast('Trận đấu chưa có đủ 2 đội khác nhau.', true);
        return;
      }
      if (!match.forfeit && match.sa === match.sb) {
        showToast('Tỷ số cầu lông không được hòa. Hãy nhập điểm thắng thực tế.', true);
        return;
      }

      executeOuterUpdate((prev) => ({
        ...prev,
        matches: prev.matches.map((m) => (m.id === matchId ? { ...m, final: true } : m)),
      }));
      showToast('✓ Đã chốt kết quả và cập nhật Bảng xếp hạng.');
    },
    [state.matches, executeOuterUpdate, showToast]
  );

  const handleReopenOuterMatch = useCallback(
    (matchId: string) => {
      executeOuterUpdate((prev) => ({
        ...prev,
        matches: prev.matches.map((m) => (m.id === matchId ? { ...m, final: false } : m)),
      }));
      showToast('Đã mở khóa trận đấu để chỉnh sửa tỷ số.');
    },
    [executeOuterUpdate, showToast]
  );

  const handleResetOuterMatch = useCallback(
    (matchId: string) => {
      executeOuterUpdate((prev) => ({
        ...prev,
        matches: prev.matches.map((m) =>
          m.id === matchId ? { ...m, sa: 0, sb: 0, forfeit: '', final: false } : m
        ),
      }));
      showToast('Đã xóa điểm về 0 - 0.');
    },
    [executeOuterUpdate, showToast]
  );

  // Tie breaker controls
  const handleTieMove = useCallback((sig: string, teamId: string, dir: -1 | 1) => {
    setState((prev) => {
      const currentStandings = calculateStandings(
        prev.teams,
        prev.matches,
        prev.tieOrder,
        prev.tieConfirm
      );
      const groupTeams = currentStandings.filter((x) => x.tieSig === sig);
      if (!groupTeams.length) return prev;

      const ids = groupTeams.map((x) => x.id);
      const at = ids.indexOf(teamId);
      const to = at + dir;
      if (to < 0 || to >= ids.length) return prev;

      [ids[at], ids[to]] = [ids[to], ids[at]];

      return {
        ...prev,
        tieOrder: { ...prev.tieOrder, [sig]: ids },
        tieConfirm: { ...prev.tieConfirm, [sig]: false },
      };
    });
  }, []);

  const handleConfirmTie = useCallback(
    (sig: string) => {
      setState((prev) => {
        const currentStandings = calculateStandings(
          prev.teams,
          prev.matches,
          prev.tieOrder,
          prev.tieConfirm
        );
        const groupTeams = currentStandings.filter((x) => x.tieSig === sig);
        return {
          ...prev,
          tieConfirm: { ...prev.tieConfirm, [sig]: true },
          tieOrder: { ...prev.tieOrder, [sig]: groupTeams.map((x) => x.id) },
        };
      });
      showToast('✓ Ban tổ chức đã xác nhận thứ tự nhóm đồng hạng.');
    },
    [showToast]
  );

  // Seed top 4 to Semifinals
  const handleSeedTop4 = useCallback(() => {
    if (!allOuterFinished) {
      showToast('Cần hoàn thành đủ 16 trận vòng ngoài trước khi vào Bán kết.', true);
      return;
    }

    const unconfirmedTies = tieGroups.filter((g) => !g.arr[0]?.tieResolved);
    if (unconfirmedTies.length > 0) {
      showToast('BTC cần bấm "BTC xác nhận thứ tự" cho các đội đồng hạng trước khi chốt bán kết.', true);
      return;
    }

    const top4 = standings.slice(0, 4);
    const summary = top4
      .map(
        (t, i) =>
          `• Hạt giống #${i + 1}: ${t.name} (${t.bonus} điểm thưởng · Hiệu số ${t.diff})`
      )
      .join('\n');

    openConfirm({
      title: 'Chốt TOP 4 & Tạo nhánh Bán kết',
      message: `Xác nhận danh sách 4 đội đứng đầu vào Vòng Bán kết:\n\n${summary}\n\nNhánh đấu:\n- Bán kết 1: Hạt giống #1 vs Hạt giống #4\n- Bán kết 2: Hạt giống #2 vs Hạt giống #3`,
      confirmLabel: 'Tạo nhánh Bán kết',
      action: () => {
        const seedIds = top4.map((t) => t.id);
        setState((prev) => ({
          ...prev,
          bracket: {
            seeds: seedIds,
            games: {
              sf1: createKnockoutGame(seedIds[0], seedIds[3]),
              sf2: createKnockoutGame(seedIds[1], seedIds[2]),
              final: null,
              third: null,
            },
          },
          page: 'semi',
        }));
        closeConfirm();
        showToast('✓ Đã chốt Top 4 và tạo 2 trận Bán kết!');
      },
    });
  }, [allOuterFinished, tieGroups, standings, openConfirm, closeConfirm, showToast]);

  const handleResetBracket = useCallback(() => {
    openConfirm({
      title: 'Xếp lại nhánh Bán kết',
      message: 'Xóa toàn bộ kết quả Bán kết và Chung kết để chốt lại thứ hạng Top 4?',
      confirmLabel: 'Xác nhận xóa & xếp lại',
      isDanger: true,
      action: () => {
        setState((prev) => ({
          ...prev,
          bracket: null,
          page: 'outer-results',
        }));
        closeConfirm();
        showToast('Đã mở lại để xếp hạt giống Bán kết.');
      },
    });
  }, [openConfirm, closeConfirm, showToast]);

  // Knockout Scoring Handlers
  const handleKoScoreChange = useCallback(
    (gameKey: 'sf1' | 'sf2' | 'final' | 'third', side: 'a' | 'b', val: number) => {
      setState((prev) => {
        if (!prev.bracket) return prev;
        const g = prev.bracket.games[gameKey];
        if (!g || g.final) return prev;

        const updated = {
          ...prev.bracket,
          games: {
            ...prev.bracket.games,
            [gameKey]: {
              ...g,
              [side === 'a' ? 'sa' : 'sb']: Math.max(0, Math.min(999, val)),
            },
          },
        };
        syncKnockoutBracket(updated);
        return { ...prev, bracket: updated };
      });
    },
    []
  );

  const handleKoForfeitChange = useCallback(
    (gameKey: 'sf1' | 'sf2' | 'final' | 'third', forfeit: '' | 'a' | 'b') => {
      setState((prev) => {
        if (!prev.bracket) return prev;
        const g = prev.bracket.games[gameKey];
        if (!g || g.final) return prev;

        const updated = {
          ...prev.bracket,
          games: {
            ...prev.bracket.games,
            [gameKey]: { ...g, forfeit },
          },
        };
        syncKnockoutBracket(updated);
        return { ...prev, bracket: updated };
      });
    },
    []
  );

  const handleKoFinalizeGame = useCallback(
    (gameKey: 'sf1' | 'sf2' | 'final' | 'third') => {
      setState((prev) => {
        if (!prev.bracket) return prev;
        const g = prev.bracket.games[gameKey];
        if (!g) return prev;

        if (!g.forfeit && g.sa === g.sb) {
          showToast('Trận đấu loại trực tiếp không được có tỷ số hòa.', true);
          return prev;
        }

        const updated = {
          ...prev.bracket,
          games: {
            ...prev.bracket.games,
            [gameKey]: { ...g, final: true },
          },
        };
        syncKnockoutBracket(updated);
        showToast('✓ Đã chốt kết quả trận đấu.');
        return { ...prev, bracket: updated };
      });
    },
    [showToast]
  );

  const handleKoReopenGame = useCallback(
    (gameKey: 'sf1' | 'sf2' | 'final' | 'third') => {
      const executeReopen = () => {
        setState((prev) => {
          if (!prev.bracket) return prev;
          const g = prev.bracket.games[gameKey];
          if (!g) return prev;

          const updated = {
            ...prev.bracket,
            games: {
              ...prev.bracket.games,
              [gameKey]: { ...g, final: false },
            },
          };
          syncKnockoutBracket(updated);
          return { ...prev, bracket: updated };
        });
        showToast('Đã mở khóa trận đấu để sửa lại tỷ số.');
      };

      if (gameKey === 'sf1' || gameKey === 'sf2') {
        const finalMatches = state.bracket?.games;
        if (
          finalMatches?.final?.final ||
          finalMatches?.third?.final ||
          (finalMatches?.final?.sa ?? 0) > 0 ||
          (finalMatches?.final?.sb ?? 0) > 0
        ) {
          openConfirm({
            title: 'Sửa kết quả Bán kết',
            message:
              'Sửa trận Bán kết sẽ đặt lại điểm số và kết quả của trận Chung kết / Tranh hạng ba. Bạn có chắc chắn muốn tiếp tục?',
            confirmLabel: 'Mở khóa Bán kết',
            isDanger: true,
            action: () => {
              executeReopen();
              closeConfirm();
            },
          });
          return;
        }
      }

      executeReopen();
    },
    [state.bracket, openConfirm, closeConfirm, showToast]
  );

  // Settings Actions
  const handleUpdateTeam = useCallback((id: string, updates: Partial<Team>) => {
    setState((prev) => ({
      ...prev,
      teams: prev.teams.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, []);

  const handleAddTeam = useCallback(() => {
    if (state.teams.length >= 32) {
      showToast('Hệ thống hỗ trợ tối đa 32 đội.', true);
      return;
    }
    const newId = `t${Date.now()}`;
    const nextNum = state.teams.length + 1;
    setState((prev) => ({
      ...prev,
      teams: [
        ...prev.teams,
        {
          id: newId,
          name: `Đội ${String(nextNum).padStart(2, '0')}`,
          p1: '',
          p2: '',
        },
      ],
    }));
    showToast('Đã thêm đội mới. Hãy kiểm tra hoặc tạo lại lịch thi đấu.');
  }, [state.teams.length, showToast]);

  const handleRemoveTeam = useCallback(
    (id: string) => {
      if (state.teams.length <= 4) {
        showToast('Cần tối thiểu 4 đội để tổ chức giải đấu trên 2 sân.', true);
        return;
      }
      openConfirm({
        title: 'Xóa đội tham gia',
        message: 'Bạn có chắc chắn muốn xóa đội này? Các trận đấu liên quan sẽ cần được xếp lại.',
        confirmLabel: 'Xác nhận xóa',
        isDanger: true,
        action: () => {
          setState((prev) => ({
            ...prev,
            teams: prev.teams.filter((t) => t.id !== id),
            matches: prev.matches.map((m) => ({
              ...m,
              a: m.a === id ? '' : m.a,
              b: m.b === id ? '' : m.b,
              final: m.a === id || m.b === id ? false : m.final,
            })),
            bracket: null,
          }));
          closeConfirm();
          showToast('Đã xóa đội.');
        },
      });
    },
    [state.teams.length, openConfirm, closeConfirm, showToast]
  );

  const handleUpdateCourtName = useCallback((index: number, name: string) => {
    setState((prev) => {
      const courts = [...prev.courts];
      courts[index] = name.trim() || `Sân ${index + 1}`;
      return { ...prev, courts };
    });
  }, []);

  const handleUpdateMatchPair = useCallback(
    (matchId: string, side: 'a' | 'b', teamId: string) => {
      executeOuterUpdate((prev) => ({
        ...prev,
        matches: prev.matches.map((m) =>
          m.id === matchId
            ? {
                ...m,
                [side]: teamId,
                final: false,
                sa: 0,
                sb: 0,
                forfeit: '',
              }
            : m
        ),
      }));
    },
    [executeOuterUpdate]
  );

  const handleRegenerateSchedule = useCallback(() => {
    openConfirm({
      title: 'Tự động chia lại 16 trận',
      message:
        'Tạo lại toàn bộ 16 trận thi đấu? Mọi tỷ số và kết quả hiện tại sẽ bị xóa. Hãy sao lưu JSON trước khi thực hiện.',
      confirmLabel: 'Tạo lịch mới',
      isDanger: true,
      action: () => {
        try {
          const newMatches = generateSchedule(state.teams);
          setState((prev) => ({
            ...prev,
            matches: newMatches,
            bracket: null,
            tieOrder: {},
            tieConfirm: {},
            court: 1,
            activeMatchId: 'm1',
          }));
          closeConfirm();
          showToast('✓ Đã tạo lại lịch 16 trận cân bằng cho 2 sân.');
        } catch (err: any) {
          showToast(err.message || 'Lỗi khi tạo lịch.', true);
        }
      },
    });
  }, [state.teams, openConfirm, closeConfirm, showToast]);

  // Demo seed data helper for training / previewing full tournament
  const handleSeedDemoScores = useCallback(() => {
    openConfirm({
      title: 'Nạp tỷ số mẫu Vòng ngoài',
      message:
        'Nạp 16 kết quả tỷ số thực tế vào Vòng ngoài để xem trước Bảng xếp hạng, Bán kết và Bục trao giải?',
      confirmLabel: 'Nạp dữ liệu mẫu',
      action: () => {
        const sampleScores: [number, number][] = [
          [21, 18],
          [21, 15],
          [19, 21],
          [21, 14],
          [21, 16],
          [17, 21],
          [21, 19],
          [21, 13],
          [22, 20],
          [16, 21],
          [21, 17],
          [21, 11],
          [20, 22],
          [21, 18],
          [21, 16],
          [21, 19],
        ];

        setState((prev) => {
          const matches = prev.matches.map((m, idx) => {
            const [sa, sb] = sampleScores[idx % sampleScores.length];
            return {
              ...m,
              sa,
              sb,
              final: true,
              forfeit: '' as const,
              referee: m.referee || 'Trọng tài Liên đoàn',
            };
          });

          return {
            ...prev,
            matches,
            bracket: null,
            tieOrder: {},
            tieConfirm: {},
            page: 'outer-results',
          };
        });
        closeConfirm();
        showToast('✓ Đã nạp 16 trận mẫu. Đang mở Bảng xếp hạng!');
      },
    });
  }, [openConfirm, closeConfirm, showToast]);

  // Data Export & Backup
  const handleBackup = useCallback(() => {
    const payload = JSON.stringify(
      {
        ...state,
        exportedAt: new Date().toISOString(),
        appName: 'Gia Phúc Cup 2026',
      },
      null,
      2
    );
    downloadFile('GiaPhucCup-2026-Backup.json', 'application/json;charset=utf-8', payload);
    showToast('✓ Đã tải xuống file sao lưu JSON an toàn.');
  }, [state, showToast]);

  const handleExportCsv = useCallback(() => {
    const csvContent = exportTournamentCsv(state);
    downloadFile('GiaPhucCup-2026-KetQua.csv', 'text/csv;charset=utf-8', csvContent);
    showToast('✓ Đã xuất báo cáo CSV thành công.');
  }, [state, showToast]);

  const handleRestoreFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (
            !parsed ||
            parsed.v !== 2 ||
            !Array.isArray(parsed.teams) ||
            parsed.teams.length < 4 ||
            !Array.isArray(parsed.matches) ||
            parsed.matches.length < 8
          ) {
            throw new Error('Định dạng file không tương thích với Gia Phúc Cup 2026.');
          }

          openConfirm({
            title: 'Khôi phục dữ liệu giải đấu',
            message:
              'Khôi phục sẽ thay thế toàn bộ dữ liệu đang lưu trên thiết bị bằng dữ liệu từ file sao lưu này. Tiếp tục?',
            confirmLabel: 'Khôi phục ngay',
            isDanger: true,
            action: () => {
              setState({
                ...createFreshTournament(),
                ...parsed,
                page: 'outer',
                court: 1,
                activeMatchId: 'm1',
              });
              closeConfirm();
              showToast('✓ Đã khôi phục dữ liệu giải đấu thành công!');
            },
          });
        } catch (err: any) {
          showToast(`Lỗi khi đọc file sao lưu: ${err.message}`, true);
        }
      };
      reader.readAsText(file);
    },
    [openConfirm, closeConfirm, showToast]
  );

  const handleResetAll = useCallback(() => {
    openConfirm({
      title: 'Khởi tạo lại giải đấu',
      message:
        'CẢNH BÁO: Khởi tạo lại giải đấu sẽ xóa TOÀN BỘ tỷ số, danh sách đội và các vòng thi đấu. Bạn đã tải file sao lưu JSON chưa?',
      confirmLabel: 'Xác nhận xóa hết & tạo mới',
      isDanger: true,
      action: () => {
        setState(createFreshTournament());
        closeConfirm();
        showToast('Đã khởi tạo giải đấu mới hoàn toàn.');
      },
    });
  }, [openConfirm, closeConfirm, showToast]);

  const handleResetTournamentScores = useCallback(() => {
    openConfirm({
      title: 'Reset điểm giải đấu',
      message:
        'Hành động này sẽ xóa toàn bộ điểm số các trận đấu vòng ngoài, kết quả bán kết và chung kết về 0 để thi đấu lại từ đầu. Danh sách các đội, vận động viên và cài đặt sân đấu sẽ ĐƯỢC GIỮ NGUYÊN.',
      confirmLabel: 'Xác nhận reset điểm',
      cancelLabel: 'Hủy bỏ',
      isDanger: true,
      action: () => {
        setState((prev) => ({
          ...prev,
          matches: prev.matches.map((m) => ({
            ...m,
            sa: 0,
            sb: 0,
            forfeit: '',
            final: false,
            referee: undefined,
          })),
          bracket: null,
          tieOrder: {},
          tieConfirm: {},
          activeMatchId: prev.matches[0]?.id || 'm1',
        }));
        setSelectedMatchForScoring(null);
        closeConfirm();
        showToast('Đã reset toàn bộ điểm số! Danh sách đội và cài đặt được giữ nguyên.');
      },
    });
  }, [openConfirm, closeConfirm, showToast]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleLoginGoogle = useCallback(async () => {
    try {
      const user = await loginWithGoogle();
      showToast(`Đã đăng nhập thành công: ${user.email}`);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        showToast(err?.message || 'Đăng nhập Google thất bại.', true);
      }
    }
  }, [showToast]);

  const handleLogoutGoogle = useCallback(async () => {
    try {
      await logoutUser();
      showToast('Đã đăng xuất tài khoản Google.');
    } catch (err: any) {
      showToast(err?.message || 'Đăng xuất thất bại.', true);
    }
  }, [showToast]);

  const handleNavigate = useCallback((page: StagePage) => {
    setState((prev) => ({ ...prev, page }));
    setSelectedMatchForScoring(null);
  }, []);

  const handleSelectCourt = useCallback((courtNum: number) => {
    setState((prev) => {
      const firstCourtMatch = prev.matches.find((m) => m.court === courtNum);
      return {
        ...prev,
        court: courtNum,
        activeMatchId: firstCourtMatch ? firstCourtMatch.id : prev.activeMatchId,
      };
    });
  }, []);

  // When user selects a match, prompt for referee name first as requested
  const handleSelectMatch = useCallback((matchId: string) => {
    setRefereePromptMatchId(matchId);
  }, []);

  const handleConfirmReferee = useCallback(
    (refereeName: string) => {
      if (refereePromptMatchId) {
        if (refereeName) {
          setLastRefereeName(refereeName);
        }
        setState((prev) => ({
          ...prev,
          matches: prev.matches.map((m) =>
            m.id === refereePromptMatchId ? { ...m, referee: refereeName } : m
          ),
          activeMatchId: refereePromptMatchId,
        }));
        setSelectedMatchForScoring(refereePromptMatchId);
        setRefereePromptMatchId(null);
      }
    },
    [refereePromptMatchId]
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-emerald-600 selection:text-white font-sans pb-10 print:p-0 print:bg-white print:text-black">
      {/* Printable Sheet (hidden on screen, visible when printing) */}
      <PrintSheet state={state} />

      {/* Screen Interface */}
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 lg:px-8 print:hidden">
        {/* Compact Masthead with Cloud Firestore sync & PIN-protected tools */}
        <Header
          currentPage={state.page}
          onNavigate={handleNavigate}
          onBackup={handleBackup}
          onRestore={() => {
            const el = document.getElementById('header-restore-input') as HTMLInputElement;
            el?.click();
          }}
          onExportCsv={handleExportCsv}
          onPrint={handlePrint}
          onSyncNow={handleSyncNow}
          onResetScores={handleResetTournamentScores}
          currentUser={currentUser}
          onLoginGoogle={handleLoginGoogle}
          onLogoutGoogle={handleLogoutGoogle}
        />

        <input
          id="header-restore-input"
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              handleRestoreFile(f);
              e.target.value = '';
            }
          }}
        />

        {/* Database Error Alert Message Banner */}
        {dbError && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs text-rose-900 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
              <div>
                <span className="font-bold text-rose-950">Lỗi kết nối / đồng bộ cơ sở dữ liệu: </span>
                <span className="text-rose-800">{dbError}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSyncNow}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-white font-bold hover:bg-rose-700 shadow-xs transition"
              >
                Thử lại
              </button>
              <button
                type="button"
                onClick={() => setDbError(null)}
                className="rounded-lg p-1 text-rose-600 hover:bg-rose-100 transition"
                title="Đóng thông báo lỗi"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 7-Stage Flow Stepper */}
        <StageNav
          currentPage={state.page}
          state={state}
          onNavigate={handleNavigate}
        />

        {/* Dynamic Stage Content */}
        <main className="mt-2 min-h-[460px]">
          {/* Stage 01: Vòng ngoài (Matches and Scoreboard) */}
          {state.page === 'outer' && (
            <div className="space-y-4">
              {/* If a match is selected, show the ScoreCard; otherwise show the Match List */}
              {selectedMatchForScoring ? (
                <ScoreCard
                  match={activeMatch}
                  courtName={state.courts[activeMatch.court - 1] || `Sân ${activeMatch.court}`}
                  teamsMap={teamsMap}
                  onScoreChange={handleScoreChange}
                  onForfeitChange={handleForfeitChange}
                  onFinalize={handleFinalizeOuterMatch}
                  onReopen={handleReopenOuterMatch}
                  onReset={handleResetOuterMatch}
                  onBackToList={() => setSelectedMatchForScoring(null)}
                  onEditReferee={() => setRefereePromptMatchId(activeMatch.id)}
                />
              ) : (
                <MatchList
                  matches={state.matches}
                  currentCourt={state.court}
                  courts={state.courts}
                  activeMatchId={activeMatch.id}
                  teamsMap={teamsMap}
                  onSelectCourt={handleSelectCourt}
                  onSelectMatch={handleSelectMatch}
                />
              )}
            </div>
          )}

          {/* Stage 02: Kết quả vòng ngoài & Bảng xếp hạng (Final 1) */}
          {state.page === 'outer-results' && (
            <StandingsTable
              standings={standings}
              tieGroups={tieGroups}
              allOuterFinished={allOuterFinished}
              hasBracket={Boolean(state.bracket)}
              teamsMap={teamsMap}
              matches={state.matches}
              onTieMove={handleTieMove}
              onConfirmTie={handleConfirmTie}
              onSeedTop4={handleSeedTop4}
              onResetBracket={handleResetBracket}
              onExportCsv={handleExportCsv}
            />
          )}

          {/* Stage 03 & 04: Vòng bán kết (2) & Kết quả bán kết (Final 2) */}
          {(state.page === 'semi' || state.page === 'semi-results') && (
            <KnockoutStage
              stage={state.page}
              bracket={state.bracket}
              teamsMap={teamsMap}
              onScoreChange={handleKoScoreChange}
              onForfeitChange={handleKoForfeitChange}
              onFinalizeGame={handleKoFinalizeGame}
              onReopenGame={handleKoReopenGame}
              onNavigate={handleNavigate}
            />
          )}

          {/* Stage 05 & 06: Vòng chung kết (3) & Kết quả chung kết (Final 3) */}
          {(state.page === 'final' || state.page === 'final-results') && (
            <KnockoutStage
              stage={state.page}
              bracket={state.bracket}
              teamsMap={teamsMap}
              onScoreChange={handleKoScoreChange}
              onForfeitChange={handleKoForfeitChange}
              onFinalizeGame={handleKoFinalizeGame}
              onReopenGame={handleKoReopenGame}
              onNavigate={handleNavigate}
            />
          )}

          {/* Stage 07: Bục vinh quang & Trao giải (4) */}
          {state.page === 'summary' && (
            <AwardsPodium
              state={state}
              teamsMap={teamsMap}
              onPrint={handlePrint}
              onBackup={handleBackup}
              onExportCsv={handleExportCsv}
            />
          )}

          {/* Settings Screen */}
          {state.page === 'settings' && (
            <SettingsModal
              state={state}
              teamsMap={teamsMap}
              onUpdateTeam={handleUpdateTeam}
              onAddTeam={handleAddTeam}
              onRemoveTeam={handleRemoveTeam}
              onUpdateCourtName={handleUpdateCourtName}
              onUpdateMatchPair={handleUpdateMatchPair}
              onRegenerateSchedule={handleRegenerateSchedule}
              onSeedDemoScores={handleSeedDemoScores}
              onBackup={handleBackup}
              onRestoreFile={handleRestoreFile}
              onResetScores={handleResetTournamentScores}
              onResetAll={handleResetAll}
              onTabChange={(tab) => setState((prev) => ({ ...prev, settingTab: tab }))}
              onBackToMatch={() => handleNavigate('outer')}
              cloudStatus={cloudStatus}
              savedTime={savedTime}
              lastUpdatedBy={lastUpdatedBy}
              onSyncNow={handleSyncNow}
              currentUser={currentUser}
              onLoginGoogle={handleLoginGoogle}
              onLogoutGoogle={handleLogoutGoogle}
            />
          )}
        </main>
      </div>

      {/* Referee Assignment Modal */}
      {refereePromptMatchId && (
        <RefereeModal
          isOpen={Boolean(refereePromptMatchId)}
          match={state.matches.find((m) => m.id === refereePromptMatchId) || null}
          courtName={
            state.courts[
              (state.matches.find((m) => m.id === refereePromptMatchId)?.court || 1) - 1
            ] || 'Sân'
          }
          teamAName={
            teamsMap[state.matches.find((m) => m.id === refereePromptMatchId)?.a || '']?.name ||
            'Đội A'
          }
          teamBName={
            teamsMap[state.matches.find((m) => m.id === refereePromptMatchId)?.b || '']?.name ||
            'Đội B'
          }
          currentReferee={
            state.matches.find((m) => m.id === refereePromptMatchId)?.referee || lastRefereeName
          }
          onConfirm={handleConfirmReferee}
          onCancel={() => setRefereePromptMatchId(null)}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        cancelLabel={modal.cancelLabel}
        isDanger={modal.isDanger}
        onConfirm={modal.action}
        onCancel={closeConfirm}
      />

      {/* Floating feedback toast */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed bottom-20 right-4 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-bold shadow-xl backdrop-blur-md sm:bottom-6 sm:right-6 max-w-sm transition-all ${
            toastMessage.bad
              ? 'border-rose-300 bg-rose-50 text-rose-900 shadow-rose-900/10'
              : 'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-emerald-900/10'
          }`}
        >
          {toastMessage.bad ? (
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
