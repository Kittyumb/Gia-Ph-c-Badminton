import React from 'react';
import { Match, Team } from '../types/tournament';
import { determineWinner } from '../lib/tournament';
import { Check, Clock, ChevronRight } from 'lucide-react';

interface MatchListProps {
  matches: Match[];
  currentCourt: number;
  courts: string[];
  activeMatchId: string;
  teamsMap: Record<string, Team>;
  onSelectCourt: (courtNum: number) => void;
  onSelectMatch: (matchId: string) => void;
}

export const MatchList: React.FC<MatchListProps> = ({
  matches,
  currentCourt,
  courts,
  activeMatchId,
  teamsMap,
  onSelectCourt,
  onSelectMatch,
}) => {
  const currentCourtMatches = matches
    .filter((m) => m.court === currentCourt)
    .sort((a, b) => a.slot - b.slot);

  const doneCount = currentCourtMatches.filter((m) => m.final).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-lg">
      {/* Court switcher tabs */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex gap-2">
          {courts.map((courtName, index) => {
            const courtNum = index + 1;
            const isActive = currentCourt === courtNum;
            const cMatches = matches.filter((m) => m.court === courtNum);
            const cDone = cMatches.filter((m) => m.final).length;

            return (
              <button
                key={courtNum}
                onClick={() => onSelectCourt(courtNum)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-emerald-700/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{courtName}</span>
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-black ${
                    isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {cDone}/8
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs font-semibold text-slate-600">
          {doneCount === 8 ? (
            <span className="text-emerald-700 font-bold">✓ 8/8 trận hoàn tất</span>
          ) : (
            <span>{doneCount}/8 trận đã có kết quả</span>
          )}
        </div>
      </div>

      {/* Match items list */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
        {currentCourtMatches.map((m) => {
          const isActive = activeMatchId === m.id;
          const teamA = teamsMap[m.a];
          const teamB = teamsMap[m.b];
          const winner = determineWinner(m);
          const matchCode = `TRẬN ${String(m.slot + (m.court === 2 ? 8 : 0)).padStart(2, '0')}`;

          return (
            <button
              key={m.id}
              onClick={() => onSelectMatch(m.id)}
              className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left transition ${
                isActive
                  ? 'border-emerald-500 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/30'
                  : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 shadow-sm'
              }`}
            >
              {/* Left slot info */}
              <div className="w-16 shrink-0">
                <span className="text-[10px] font-black text-emerald-700">{matchCode}</span>
                <div className="text-xs font-bold text-slate-600">Lượt {m.slot}</div>
                {m.referee && (
                  <div className="mt-0.5 truncate text-[9px] font-semibold text-slate-500" title={`Trọng tài: ${m.referee}`}>
                    TT: {m.referee}
                  </div>
                )}
              </div>

              {/* Team names */}
              <div className="min-w-0 flex-1 px-3">
                <div
                  className={`truncate text-xs font-bold ${
                    winner === 'a' ? 'text-emerald-700 font-black' : 'text-slate-900'
                  }`}
                >
                  {teamA?.name || '—'}
                </div>
                <div
                  className={`truncate text-xs font-bold ${
                    winner === 'b' ? 'text-amber-700 font-black' : 'text-slate-700'
                  }`}
                >
                  {teamB?.name || '—'}
                </div>
              </div>

              {/* Score / Status */}
              <div className="flex items-center gap-3 shrink-0 pl-2">
                <div className="text-right">
                  {m.final ? (
                    <div>
                      <div className="font-mono text-base font-black text-slate-900 tabular-nums">
                        {m.forfeit ? (
                          <span className="text-amber-700 text-xs font-bold">Bỏ cuộc</span>
                        ) : (
                          `${m.sa} : ${m.sb}`
                        )}
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-700 font-bold">
                        <Check className="h-3 w-3" />
                        <span>Đã chốt</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-mono text-sm font-semibold text-slate-400 tabular-nums">
                        {m.sa > 0 || m.sb > 0 ? `${m.sa} : ${m.sb}` : '— : —'}
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[10px] text-amber-700 font-bold">
                        <Clock className="h-3 w-3" />
                        <span>Chưa đấu</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-emerald-600 hover:text-white transition">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
