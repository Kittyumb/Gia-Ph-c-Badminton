import React from 'react';
import { StagePage, TournamentState } from '../types/tournament';
import { getAwards } from '../lib/tournament';

interface StageNavProps {
  currentPage: StagePage;
  state: TournamentState;
  onNavigate: (page: StagePage) => void;
}

const STAGES: { id: StagePage; numBadge: string; label: string; icon: string }[] = [
  { id: 'outer', numBadge: '1', label: 'Vòng ngoài', icon: '🏸' },
  { id: 'outer-results', numBadge: 'Final 1', label: 'Kết quả vòng ngoài', icon: '📊' },
  { id: 'semi', numBadge: '2', label: 'Vòng bán kết', icon: '⚔️' },
  { id: 'semi-results', numBadge: 'Final 2', label: 'Kết quả bán kết', icon: '📋' },
  { id: 'final', numBadge: '3', label: 'Vòng chung kết', icon: '🏆' },
  { id: 'final-results', numBadge: 'Final 3', label: 'Kết quả chung kết', icon: '📜' },
  { id: 'summary', numBadge: '4', label: 'Tổng kết và trao giải', icon: '🥇' },
];

export const StageNav: React.FC<StageNavProps> = ({
  currentPage,
  state,
  onNavigate,
}) => {
  const games = state.bracket?.games;
  const isReady = (id: StagePage): boolean => {
    switch (id) {
      case 'outer':
        return true;
      case 'outer-results':
        return state.matches.some((m) => m.final);
      case 'semi':
        return Boolean(state.bracket);
      case 'semi-results':
        return Boolean(games?.sf1?.final || games?.sf2?.final);
      case 'final':
        return Boolean(games?.final);
      case 'final-results':
        return Boolean(games?.final?.final || games?.third?.final);
      case 'summary':
        return Boolean(getAwards(state.bracket));
      default:
        return false;
    }
  };

  return (
    <>
      <div className="mb-2 flex items-center justify-between text-xs font-bold text-emerald-800 tracking-wider">
        <span>Giải đấu 3 vòng loại</span>
      </div>

      <nav
        aria-label="Lộ trình các vòng thi đấu"
        className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none"
      >
        {STAGES.map((s) => {
          const active = currentPage === s.id;
          const ready = isReady(s.id);

          return (
            <button
              key={s.id}
              onClick={() => onNavigate(s.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition shadow-sm ${
                active
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-emerald-700/20 shadow-md ring-2 ring-emerald-500/30'
                  : ready
                  ? 'border-emerald-200 bg-white text-emerald-900 hover:border-emerald-400 hover:bg-emerald-50'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <span
                className={`flex h-5 items-center justify-center rounded-md px-1.5 text-[10px] font-black tracking-tight ${
                  active
                    ? 'bg-emerald-800 text-emerald-100'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {s.numBadge}
              </span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
