import React from 'react';
import { TournamentState } from '../types/tournament';

interface OverviewMetricsProps {
  state: TournamentState;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({ state }) => {
  const outerDone = state.matches.filter((m) => m.final).length;
  const outerTotal = state.matches.length || 16;
  const outerPct = Math.round((outerDone / outerTotal) * 100);

  const games = state.bracket?.games;
  const semiDone = [games?.sf1, games?.sf2].filter((g) => g?.final).length;
  const semiPct = Math.round((semiDone / 2) * 100);

  const finalDone = [games?.final, games?.third].filter((g) => g?.final).length;
  const finalPct = Math.round((finalDone / 2) * 100);

  return (
    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="text-[10px] font-black tracking-wider text-emerald-800 uppercase">
          TRẬN VÒNG NGOÀI
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <strong className="text-2xl font-black tabular-nums text-slate-900">
            {outerDone}/{outerTotal}
          </strong>
          <span className="text-xs font-bold text-emerald-700">{outerPct}%</span>
        </div>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
            style={{ width: `${outerPct}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="text-[10px] font-black tracking-wider text-emerald-800 uppercase">
          ĐỘI THAM GIA
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <strong className="text-2xl font-black text-slate-900">
            {state.teams.length} <span className="text-sm font-semibold text-slate-500">đội</span>
          </strong>
          <span className="text-[11px] font-bold text-slate-500">Đánh đôi</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 font-medium">
          2 sân · {state.courts.join(' & ')}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="text-[10px] font-black tracking-wider text-emerald-800 uppercase">
          VÒNG BÁN KẾT
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <strong className="text-2xl font-black tabular-nums text-slate-900">
            {semiDone}/2 <span className="text-sm font-semibold text-slate-500">trận</span>
          </strong>
          <span className="text-xs font-bold text-emerald-700">{semiPct}%</span>
        </div>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
            style={{ width: `${semiPct}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="text-[10px] font-black tracking-wider text-emerald-800 uppercase">
          VÒNG CHUNG KẾT
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <strong className="text-2xl font-black tabular-nums text-slate-900">
            {finalDone}/2 <span className="text-sm font-semibold text-slate-500">trận</span>
          </strong>
          <span className="text-xs font-bold text-amber-700">{finalPct}%</span>
        </div>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-300"
            style={{ width: `${finalPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};
