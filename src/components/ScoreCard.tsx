import React, { useState } from 'react';
import { Match, Team } from '../types/tournament';
import { determineWinner } from '../lib/tournament';
import { Check, Edit3, RotateCcw, ArrowLeft, ArrowLeftRight } from 'lucide-react';

interface ScoreCardProps {
  match: Match;
  courtName: string;
  teamsMap: Record<string, Team>;
  onScoreChange: (side: 'a' | 'b', value: number) => void;
  onForfeitChange: (forfeit: '' | 'a' | 'b') => void;
  onFinalize: (matchId: string) => void;
  onReopen: (matchId: string) => void;
  onReset: (matchId: string) => void;
  onBackToList?: () => void;
  onEditReferee?: () => void;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  match,
  courtName,
  teamsMap,
  onScoreChange,
  onForfeitChange,
  onFinalize,
  onReopen,
  onReset,
  onBackToList,
  onEditReferee,
}) => {
  const [swappedMatches, setSwappedMatches] = useState<Record<string, boolean>>({});
  const isSwapped = Boolean(swappedMatches[match.id]);

  const toggleSwap = () => {
    setSwappedMatches((prev) => ({
      ...prev,
      [match.id]: !prev[match.id],
    }));
  };

  const teamA = teamsMap[match.a];
  const teamB = teamsMap[match.b];
  const winner = determineWinner(match);
  const isEditing = !match.final;

  // Determine left and right perspective for referee
  const leftSide: 'a' | 'b' = isSwapped ? 'b' : 'a';
  const rightSide: 'a' | 'b' = isSwapped ? 'a' : 'b';

  const leftTeam = leftSide === 'a' ? teamA : teamB;
  const rightTeam = rightSide === 'a' ? teamA : teamB;

  const leftScore = leftSide === 'a' ? match.sa : match.sb;
  const rightScore = rightSide === 'a' ? match.sa : match.sb;

  const leftLabel = leftSide === 'a' ? 'ĐỘI A' : 'ĐỘI B';
  const rightLabel = rightSide === 'a' ? 'ĐỘI A' : 'ĐỘI B';

  const isLeftWinner = winner === leftSide;
  const isRightWinner = winner === rightSide;

  const leftTheme =
    leftSide === 'a'
      ? {
          badge: 'text-emerald-700 bg-emerald-100',
          title: 'text-emerald-700',
          scoreText: 'text-emerald-600',
          focusRing: 'focus:ring-emerald-500',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700',
          cardBorder: isLeftWinner
            ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500/50'
            : 'border-slate-200 bg-slate-50/70',
        }
      : {
          badge: 'text-amber-700 bg-amber-100',
          title: 'text-amber-700',
          scoreText: 'text-amber-600',
          focusRing: 'focus:ring-amber-500',
          btnBg: 'bg-amber-600 hover:bg-amber-700',
          cardBorder: isLeftWinner
            ? 'border-amber-500 bg-amber-50/70 shadow-sm ring-1 ring-amber-500/50'
            : 'border-slate-200 bg-slate-50/70',
        };

  const rightTheme =
    rightSide === 'a'
      ? {
          badge: 'text-emerald-700 bg-emerald-100',
          title: 'text-emerald-700',
          scoreText: 'text-emerald-600',
          focusRing: 'focus:ring-emerald-500',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700',
          cardBorder: isRightWinner
            ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500/50'
            : 'border-slate-200 bg-slate-50/70',
        }
      : {
          badge: 'text-amber-700 bg-amber-100',
          title: 'text-amber-700',
          scoreText: 'text-amber-600',
          focusRing: 'focus:ring-amber-500',
          btnBg: 'bg-amber-600 hover:bg-amber-700',
          cardBorder: isRightWinner
            ? 'border-amber-500 bg-amber-50/70 shadow-sm ring-1 ring-amber-500/50'
            : 'border-slate-200 bg-slate-50/70',
        };

  const handleStep = (side: 'a' | 'b', delta: number) => {
    if (!isEditing || match.forfeit) return;
    const current = side === 'a' ? match.sa : match.sb;
    const next = Math.max(0, Math.min(999, current + delta));
    onScoreChange(side, next);
  };

  const handleDirectInput = (side: 'a' | 'b', e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing || match.forfeit) return;
    const val = parseInt(e.target.value, 10);
    onScoreChange(side, isNaN(val) ? 0 : Math.max(0, Math.min(999, val)));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-lg text-slate-900">
      {/* Redesigned spacious & structured header */}
      <div className="border-b border-slate-100 pb-3.5 space-y-2.5">
        {/* Top Control Bar: Navigation on the left, Status on the right */}
        <div className="flex items-center justify-between gap-2">
          {onBackToList ? (
            <button
              type="button"
              onClick={onBackToList}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 px-3 py-1.5 text-xs font-bold text-slate-700 transition shadow-2xs shrink-0"
              title="Quay lại danh sách trận đấu"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                match.final
                  ? 'border border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border border-amber-300 bg-amber-50 text-amber-800'
              }`}
            >
              {match.final ? '✓ Đã chốt' : '● Đang ghi điểm'}
            </span>
          </div>
        </div>

        {/* Title & Metadata Row: Dedicated space for Court, Match name and Referee */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-md bg-emerald-600 px-2.5 py-0.5 text-xs font-black text-white uppercase tracking-wider shadow-2xs shrink-0">
              {courtName}
            </span>

            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight whitespace-nowrap">
              Trận {match.slot + (match.court === 2 ? 8 : 0)} · Lượt {match.slot}
            </h3>

            {(teamA?.name || teamB?.name) && (
              <span className="text-xs font-semibold text-slate-500 hidden md:inline-flex items-center gap-1.5">
                <span className="text-slate-300">•</span>
                <span>{teamA?.name || 'Đội A'} vs {teamB?.name || 'Đội B'}</span>
              </span>
            )}
          </div>

          {/* Referee Pill */}
          <div className="flex items-center gap-2 shrink-0">
            {match.referee ? (
              <button
                type="button"
                onClick={onEditReferee}
                title="Bấm để đổi trọng tài điều hành"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 transition"
              >
                <span className="text-[11px] font-medium text-slate-500">Trọng tài:</span>
                <span className="font-extrabold text-slate-900">{match.referee}</span>
                <Edit3 className="h-3 w-3 text-slate-400" />
              </button>
            ) : onEditReferee ? (
              <button
                type="button"
                onClick={onEditReferee}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 transition"
              >
                <span>+ Chỉ định trọng tài</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Scoreboard with Left/Right perspective - items-stretch for identical height */}
      <div className="my-5 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 sm:gap-4">
        {/* Left Side Court Team */}
        <div className={`flex flex-col justify-between rounded-2xl border p-3 sm:p-4 transition ${leftTheme.cardBorder}`}>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <span className={`text-[10px] font-black tracking-widest uppercase ${leftTheme.title}`}>
                {leftLabel}
              </span>
              <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                Sân trái
              </span>
            </div>

            {/* Team Name & Members Container: Fixed height so both cards always align identical to the pixel */}
            <div className="mt-1 flex h-[58px] sm:h-[62px] w-full flex-col justify-center text-center px-1">
              <h4 className="text-sm sm:text-base font-black text-slate-900 truncate" title={leftTeam?.name}>
                {leftTeam?.name || '— Chưa chọn —'}
              </h4>
              <div className="mt-0.5 flex flex-col justify-center min-w-0">
                {leftTeam?.p1 || leftTeam?.p2 ? (
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-[11px] leading-tight text-slate-600 font-semibold truncate" title={leftTeam.p1 || ''}>
                      {leftTeam.p1 || '—'}
                    </p>
                    <p className="text-[11px] leading-tight text-slate-500 font-medium truncate" title={leftTeam.p2 || ''}>
                      {leftTeam.p2 || '—'}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">Chưa chọn VĐV</p>
                )}
              </div>
            </div>
          </div>

          {/* Point Display */}
          <div className="my-2 flex w-full items-center justify-center">
            <input
              type="number"
              aria-label={`Điểm số ${leftTeam?.name || leftLabel}`}
              inputMode="numeric"
              min={0}
              max={999}
              disabled={!isEditing || !!match.forfeit}
              value={leftScore}
              onChange={(e) => handleDirectInput(leftSide, e)}
              className={`w-full text-center font-mono text-5xl sm:text-7xl font-black ${leftTheme.scoreText} tracking-tight bg-white border border-slate-200 shadow-inner outline-none focus:ring-2 ${leftTheme.focusRing} rounded-xl py-2`}
            />
          </div>

          {/* Quick Step Buttons */}
          <div className="pt-1">
            {isEditing && !match.forfeit ? (
              <div className="grid w-full grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleStep(leftSide, -1)}
                  disabled={leftScore <= 0}
                  className="h-11 rounded-xl border border-slate-300 bg-white text-lg font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 shadow-xs transition"
                >
                  −1
                </button>
                <button
                  type="button"
                  onClick={() => handleStep(leftSide, 1)}
                  className={`h-11 rounded-xl ${leftTheme.btnBg} text-lg font-black text-white shadow-xs transition`}
                >
                  +1
                </button>
              </div>
            ) : (
              <div className="h-11" />
            )}
          </div>
        </div>

        {/* VS Divider & Quick Swap Button */}
        <div className="flex flex-col items-center justify-center px-0.5 sm:px-1 text-center shrink-0 self-stretch">
          <span className="font-mono text-xs font-black text-slate-400">VS</span>
          <button
            type="button"
            onClick={toggleSwap}
            className={`mt-2 flex h-8 w-8 items-center justify-center rounded-full border transition active:scale-90 ${
              isSwapped
                ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-xs ring-2 ring-indigo-200'
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 shadow-xs'
            }`}
            title="Bấm để đổi sân (Trái ⇄ Phải)"
            aria-label="Đổi sân Trái Phải"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Right Side Court Team */}
        <div className={`flex flex-col justify-between rounded-2xl border p-3 sm:p-4 transition ${rightTheme.cardBorder}`}>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <span className={`text-[10px] font-black tracking-widest uppercase ${rightTheme.title}`}>
                {rightLabel}
              </span>
              <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                Sân phải
              </span>
            </div>

            {/* Team Name & Members Container: Fixed height so both cards always align identical to the pixel */}
            <div className="mt-1 flex h-[58px] sm:h-[62px] w-full flex-col justify-center text-center px-1">
              <h4 className="text-sm sm:text-base font-black text-slate-900 truncate" title={rightTeam?.name}>
                {rightTeam?.name || '— Chưa chọn —'}
              </h4>
              <div className="mt-0.5 flex flex-col justify-center min-w-0">
                {rightTeam?.p1 || rightTeam?.p2 ? (
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-[11px] leading-tight text-slate-600 font-semibold truncate" title={rightTeam.p1 || ''}>
                      {rightTeam.p1 || '—'}
                    </p>
                    <p className="text-[11px] leading-tight text-slate-500 font-medium truncate" title={rightTeam.p2 || ''}>
                      {rightTeam.p2 || '—'}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">Chưa chọn VĐV</p>
                )}
              </div>
            </div>
          </div>

          {/* Point Display */}
          <div className="my-2 flex w-full items-center justify-center">
            <input
              type="number"
              aria-label={`Điểm số ${rightTeam?.name || rightLabel}`}
              inputMode="numeric"
              min={0}
              max={999}
              disabled={!isEditing || !!match.forfeit}
              value={rightScore}
              onChange={(e) => handleDirectInput(rightSide, e)}
              className={`w-full text-center font-mono text-5xl sm:text-7xl font-black ${rightTheme.scoreText} tracking-tight bg-white border border-slate-200 shadow-inner outline-none focus:ring-2 ${rightTheme.focusRing} rounded-xl py-2`}
            />
          </div>

          {/* Quick Step Buttons */}
          <div className="pt-1">
            {isEditing && !match.forfeit ? (
              <div className="grid w-full grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleStep(rightSide, -1)}
                  disabled={rightScore <= 0}
                  className="h-11 rounded-xl border border-slate-300 bg-white text-lg font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 shadow-xs transition"
                >
                  −1
                </button>
                <button
                  type="button"
                  onClick={() => handleStep(rightSide, 1)}
                  className={`h-11 rounded-xl ${rightTheme.btnBg} text-lg font-black text-white shadow-xs transition`}
                >
                  +1
                </button>
              </div>
            ) : (
              <div className="h-11" />
            )}
          </div>
        </div>
      </div>

      {/* Forfeit selector */}
      <div className="mb-4 flex flex-col gap-1.5 sm:flex-row sm:items-center">
        <label className="text-xs font-bold text-slate-700 sm:w-36">
          Trạng thái trận đấu:
        </label>
        <select
          value={match.forfeit}
          disabled={!isEditing}
          onChange={(e) => onForfeitChange(e.target.value as '' | 'a' | 'b')}
          className="flex-1 rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-800 shadow-sm focus:border-emerald-600 focus:outline-none"
        >
          <option value="">Thi đấu bình thường (Tính điểm & hiệu số)</option>
          <option value="a">
            {teamA?.name || 'Đội A'} bỏ cuộc (Đối thủ thắng 2-0, không tính hiệu số)
          </option>
          <option value="b">
            {teamB?.name || 'Đội B'} bỏ cuộc (Đối thủ thắng 2-0, không tính hiệu số)
          </option>
        </select>
      </div>

      {/* Status Notice if final */}
      {match.final && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900">
          <p className="font-bold text-emerald-900">
            ✓ Trận đấu đã hoàn tất:{' '}
            <span className="font-black text-emerald-700">
              {winner === 'a' ? teamA?.name : winner === 'b' ? teamB?.name : 'Chưa rõ'} thắng.
            </span>
          </p>
          <p className="mt-0.5 text-emerald-800/80">
            {match.forfeit
              ? 'Đội thắng nhận +2 điểm thưởng. Trận bỏ cuộc không tính hiệu số điểm.'
              : 'Đội thắng nhận +2 điểm thưởng, đội thua nhận +1 điểm thưởng. Hiệu số điểm đã được cập nhật.'}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        {isEditing ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onReset(match.id)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Xóa điểm</span>
              </button>

              {/* Nút đổi sân kế nút xóa điểm theo yêu cầu */}
              <button
                type="button"
                onClick={toggleSwap}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-xs transition active:scale-95 ${
                  isSwapped
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-800 font-bold ring-1 ring-indigo-400'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                title="Đổi vị trí hiển thị giữa 2 phần sân (Trái ⇄ Phải) để thuận mắt nhìn từ bàn trọng tài"
              >
                <ArrowLeftRight className={`h-3.5 w-3.5 ${isSwapped ? 'text-indigo-700' : 'text-slate-500'}`} />
                <span>Đổi sân {isSwapped ? '(Đang đổi bên)' : ''}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onFinalize(match.id)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-700"
            >
              <Check className="h-4 w-4" />
              <span>Chốt kết quả trận này</span>
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                <Check className="h-4 w-4" />
                <span>Kết quả đã khóa an toàn</span>
              </div>

              <button
                type="button"
                onClick={toggleSwap}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-xs transition active:scale-95 ${
                  isSwapped
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-800 font-bold'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                title="Đổi vị trí hiển thị giữa 2 phần sân (Trái ⇄ Phải)"
              >
                <ArrowLeftRight className="h-3 w-3 text-indigo-600" />
                <span>Đổi sân {isSwapped ? '(Đang đổi bên)' : ''}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onReopen(match.id)}
              className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Sửa lại kết quả</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
