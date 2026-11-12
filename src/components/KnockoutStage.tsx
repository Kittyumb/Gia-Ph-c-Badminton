import React from 'react';
import { Bracket, KoGame, Team } from '../types/tournament';
import { determineWinner } from '../lib/tournament';
import { Trophy, Medal, Check, Edit3, ArrowRight } from 'lucide-react';

interface KnockoutStageProps {
  stage: 'semi' | 'semi-results' | 'final' | 'final-results';
  bracket: Bracket | null;
  teamsMap: Record<string, Team>;
  onScoreChange: (gameKey: 'sf1' | 'sf2' | 'final' | 'third', side: 'a' | 'b', val: number) => void;
  onForfeitChange: (gameKey: 'sf1' | 'sf2' | 'final' | 'third', forfeit: '' | 'a' | 'b') => void;
  onFinalizeGame: (gameKey: 'sf1' | 'sf2' | 'final' | 'third') => void;
  onReopenGame: (gameKey: 'sf1' | 'sf2' | 'final' | 'third') => void;
  onNavigate: (page: any) => void;
}

export const KnockoutStage: React.FC<KnockoutStageProps> = ({
  stage,
  bracket,
  teamsMap,
  onScoreChange,
  onForfeitChange,
  onFinalizeGame,
  onReopenGame,
  onNavigate,
}) => {
  if (!bracket) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-8 text-center text-slate-800 shadow-sm">
        <Trophy className="mx-auto h-12 w-12 text-amber-600" />
        <h3 className="mt-3 text-lg font-bold text-slate-900">Chưa tạo nhánh loại trực tiếp</h3>
        <p className="mt-1 text-xs text-slate-600">
          Hãy hoàn thành các trận vòng ngoài và bấm "Chốt TOP 4 → Vào Bán kết" tại màn hình Bảng xếp hạng.
        </p>
        <button
          onClick={() => onNavigate('outer-results')}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-700 shadow-sm"
        >
          <span>Đến Bảng xếp hạng</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  const { sf1, sf2, final, third } = bracket.games;
  const isSemiMode = stage === 'semi' || stage === 'semi-results';

  const renderGameCard = (
    gameKey: 'sf1' | 'sf2' | 'final' | 'third',
    title: string,
    subtitle: string,
    game: KoGame | null,
    icon?: React.ReactNode
  ) => {
    if (!game) {
      return (
        <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-400 shadow-sm min-h-[220px]">
          <div className="text-sm font-bold text-slate-700">{title}</div>
          <p className="mt-1 text-xs text-slate-500">Đang chờ xác định các đội từ vòng trước...</p>
        </div>
      );
    }

    const teamA = teamsMap[game.a];
    const teamB = teamsMap[game.b];
    const winner = determineWinner(game);
    const isEditing = !game.final;

    const handleStep = (side: 'a' | 'b', delta: number) => {
      if (!isEditing || game.forfeit) return;
      const current = side === 'a' ? game.sa : game.sb;
      onScoreChange(gameKey, side, Math.max(0, Math.min(999, current + delta)));
    };

    return (
      <div
        key={gameKey}
        className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-900"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              {icon}
              <div>
                <h4 className="text-base font-black text-slate-900">{title}</h4>
                <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>
              </div>
            </div>

            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                game.final
                  ? 'border border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border border-amber-300 bg-amber-50 text-amber-800'
              }`}
            >
              {game.final ? '✓ Đã hoàn tất' : '● Đang thi đấu'}
            </span>
          </div>

          {/* Teams scoring row */}
          <div className="my-4 space-y-3">
            {/* Team A */}
            <div
              className={`flex items-center justify-between rounded-2xl border p-3.5 ${
                winner === 'a'
                  ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                  : 'border-slate-200 bg-slate-50/70'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-slate-900">
                    {teamA?.name || '—'}
                  </span>
                  {winner === 'a' && (
                    <span className="rounded-md bg-emerald-600 px-1.5 py-0.2 text-[9px] font-black text-white">
                      THẮNG
                    </span>
                  )}
                </div>
                {(teamA?.p1 || teamA?.p2) && (
                  <div className="truncate text-[11px] text-slate-500 font-medium">
                    {[teamA.p1, teamA.p2].filter(Boolean).join(' & ')}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditing && !game.forfeit && (
                  <button
                    type="button"
                    onClick={() => handleStep('a', -1)}
                    disabled={game.sa <= 0}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-sm font-black text-slate-700 hover:bg-slate-100 disabled:opacity-30 shadow-xs"
                  >
                    −1
                  </button>
                )}
                <input
                  type="number"
                  aria-label={`Điểm số ${teamA?.name || 'Đội A'}`}
                  inputMode="numeric"
                  min={0}
                  max={999}
                  disabled={!isEditing || !!game.forfeit}
                  value={game.sa}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    onScoreChange(gameKey, 'a', isNaN(val) ? 0 : val);
                  }}
                  className="w-14 rounded-xl bg-white p-1 text-center font-mono text-2xl font-black text-emerald-700 border border-slate-300 shadow-inner focus:border-emerald-600 focus:outline-none"
                />
                {isEditing && !game.forfeit && (
                  <button
                    type="button"
                    onClick={() => handleStep('a', 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-black text-white hover:bg-emerald-700 shadow-xs"
                  >
                    +1
                  </button>
                )}
              </div>
            </div>

            {/* Team B */}
            <div
              className={`flex items-center justify-between rounded-2xl border p-3.5 ${
                winner === 'b'
                  ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                  : 'border-slate-200 bg-slate-50/70'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-slate-900">
                    {teamB?.name || '—'}
                  </span>
                  {winner === 'b' && (
                    <span className="rounded-md bg-amber-600 px-1.5 py-0.2 text-[9px] font-black text-white">
                      THẮNG
                    </span>
                  )}
                </div>
                {(teamB?.p1 || teamB?.p2) && (
                  <div className="truncate text-[11px] text-slate-500 font-medium">
                    {[teamB.p1, teamB.p2].filter(Boolean).join(' & ')}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditing && !game.forfeit && (
                  <button
                    type="button"
                    onClick={() => handleStep('b', -1)}
                    disabled={game.sb <= 0}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-sm font-black text-slate-700 hover:bg-slate-100 disabled:opacity-30 shadow-xs"
                  >
                    −1
                  </button>
                )}
                <input
                  type="number"
                  aria-label={`Điểm số ${teamB?.name || 'Đội B'}`}
                  inputMode="numeric"
                  min={0}
                  max={999}
                  disabled={!isEditing || !!game.forfeit}
                  value={game.sb}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    onScoreChange(gameKey, 'b', isNaN(val) ? 0 : val);
                  }}
                  className="w-14 rounded-xl bg-white p-1 text-center font-mono text-2xl font-black text-amber-700 border border-slate-300 shadow-inner focus:border-amber-600 focus:outline-none"
                />
                {isEditing && !game.forfeit && (
                  <button
                    type="button"
                    onClick={() => handleStep('b', 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 text-sm font-black text-white hover:bg-amber-700 shadow-xs"
                  >
                    +1
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Forfeit selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 font-medium shrink-0">Bỏ cuộc:</span>
            <select
              value={game.forfeit}
              disabled={!isEditing}
              onChange={(e) => onForfeitChange(gameKey, e.target.value as '' | 'a' | 'b')}
              className="flex-1 rounded-xl border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-800 shadow-xs focus:border-emerald-600 focus:outline-none"
            >
              <option value="">Không có đội bỏ cuộc</option>
              <option value="a">{teamA?.name || 'Đội A'} bỏ cuộc</option>
              <option value="b">{teamB?.name || 'Đội B'} bỏ cuộc</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 border-t border-slate-100 pt-3">
          {isEditing ? (
            <button
              type="button"
              onClick={() => onFinalizeGame(gameKey)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-black text-white shadow-md hover:bg-emerald-700"
            >
              <Check className="h-4 w-4" />
              <span>Chốt kết quả trận đấu</span>
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-700 font-semibold">
                Thắng:{' '}
                <strong className="text-emerald-800 font-bold">
                  {winner === 'a' ? teamA?.name : winner === 'b' ? teamB?.name : '—'}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => onReopenGame(gameKey)}
                className="flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100"
              >
                <Edit3 className="h-3 w-3" />
                <span>Sửa</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Stage Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-[10px] font-black tracking-widest text-emerald-700 uppercase">
          {isSemiMode ? '2. VÒNG BÁN KẾT / FINAL 2' : '3. VÒNG CHUNG KẾT / FINAL 3'}
        </div>
        <h3 className="text-xl font-black text-slate-900">
          {isSemiMode ? 'Vòng bán kết' : 'Vòng chung kết & Tranh hạng ba'}
        </h3>
        <p className="mt-1 text-xs text-slate-600">
          {isSemiMode
            ? 'Đội hạng 1 gặp đội hạng 4 · Đội hạng 2 gặp đội hạng 3. Hai đội thắng vào Chung kết, hai đội thua tranh hạng ba.'
            : 'Trận Chung kết xác định Quán quân & Á quân · Trận Tranh hạng ba xác định Hạng 3 & Hạng 4.'}
        </p>

        {/* Seed pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {bracket.seeds.map((teamId, idx) => {
            const team = teamsMap[teamId];
            return (
              <div
                key={teamId}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-900"
              >
                <span className="font-mono text-[10px] font-black text-emerald-700">
                  #{idx + 1}
                </span>
                <span className="font-bold">{team?.name || '—'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid of Knockout Match Cards */}
      {isSemiMode ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {renderGameCard(
            'sf1',
            'Bán kết 01',
            'Hạt giống #1 × Hạt giống #4',
            sf1,
            <Medal className="h-5 w-5 text-emerald-700" />
          )}
          {renderGameCard(
            'sf2',
            'Bán kết 02',
            'Hạt giống #2 × Hạt giống #3',
            sf2,
            <Medal className="h-5 w-5 text-emerald-700" />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {renderGameCard(
            'final',
            '🏆 Trận Chung Kết',
            'Tranh ngôi Vô địch (Giải Nhất & Giải Nhì)',
            final,
            <Trophy className="h-6 w-6 text-amber-600" />
          )}
          {renderGameCard(
            'third',
            '🥉 Trận Tranh Hạng Ba',
            'Tranh Giải Ba & Hạng Tư',
            third,
            <Medal className="h-5 w-5 text-amber-700" />
          )}
        </div>
      )}

      {/* Stage completion notice without redundant jump buttons */}
      {isSemiMode && sf1?.final && sf2?.final && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm">
          <h4 className="text-sm font-bold text-emerald-950">✓ Đã hoàn tất cả 2 trận Bán kết!</h4>
          <p className="text-xs text-emerald-800">
            Chung kết:{' '}
            <strong className="text-emerald-900">
              {teamsMap[final?.a || '']?.name} × {teamsMap[final?.b || '']?.name}
            </strong>{' '}
            · Tranh hạng 3:{' '}
            <strong className="text-emerald-900">
              {teamsMap[third?.a || '']?.name} × {teamsMap[third?.b || '']?.name}
            </strong>
          </p>
        </div>
      )}

      {!isSemiMode && final?.final && third?.final && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm text-slate-900">
          <h4 className="text-sm font-bold text-amber-950">🏆 Đã có kết quả Chung cuộc giải đấu!</h4>
          <p className="text-xs text-amber-900/80">
            Đã xác định đủ 4 thứ hạng trao giải: Nhất, Nhì, Ba và Tư.
          </p>
        </div>
      )}
    </div>
  );
};
