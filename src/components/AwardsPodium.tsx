import React from 'react';
import { Bracket, Team, TournamentState } from '../types/tournament';
import { getAwards, DEFAULT_PRIZES } from '../lib/tournament';
import { Trophy, Medal, Printer, Download, FileSpreadsheet, Sparkles } from 'lucide-react';

interface AwardsPodiumProps {
  state: TournamentState;
  teamsMap: Record<string, Team>;
  onPrint: () => void;
  onBackup: () => void;
  onExportCsv: () => void;
}

export const AwardsPodium: React.FC<AwardsPodiumProps> = ({
  state,
  teamsMap,
  onPrint,
  onBackup,
  onExportCsv,
}) => {
  const awards = getAwards(state.bracket);
  const team1 = awards ? teamsMap[awards.first] : null;
  const team2 = awards ? teamsMap[awards.second] : null;
  const team3 = awards ? teamsMap[awards.third] : null;
  const team4 = awards ? teamsMap[awards.fourth] : null;

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-widest text-amber-700 uppercase">
            <Sparkles className="h-3 w-3" />
            GIAI ĐOẠN 04 / BẢNG VINH DANH & TRAO GIẢI
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            Tổng kết và trao giải Gia Phúc Cup 2026
          </h3>
          <p className="mt-1 text-xs text-slate-600">
            20h00 · 12/11/2026 · Sân cầu lông Gia Phúc · Lễ trao thưởng chính thức
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-white shadow-md hover:bg-amber-600"
          >
            <Printer className="h-4 w-4" />
            <span>In biên bản giải</span>
          </button>
        </div>
      </div>

      {/* Podium Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* 2nd Place */}
        <div className="order-2 flex flex-col justify-between rounded-2xl border border-slate-300 bg-white p-6 text-center shadow-md md:order-1 md:mt-6">
          <div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-3xl shadow-inner">
              🥈
            </div>
            <div className="mt-3 text-[10px] font-black tracking-widest text-slate-500 uppercase">
              {DEFAULT_PRIZES.second.title}
            </div>
            <h4 className="mt-1 min-h-[36px] text-lg font-black text-slate-900">
              {team2?.name || '— Chưa xác định —'}
            </h4>
            {(team2?.p1 || team2?.p2) && (
              <p className="text-xs text-slate-500 font-medium">
                {[team2.p1, team2.p2].filter(Boolean).join(' & ')}
              </p>
            )}
          </div>

          <div className="mt-5 border-t border-slate-100 pt-3">
            <div className="text-2xl font-black text-slate-800 font-mono">
              {DEFAULT_PRIZES.second.cash}
            </div>
            <div className="mt-0.5 text-xs text-slate-500 font-semibold">{DEFAULT_PRIZES.second.extra}</div>
          </div>
        </div>

        {/* 1st Place - Champion */}
        <div className="order-1 flex flex-col justify-between rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-50/80 via-white to-amber-50/50 p-7 text-center shadow-xl md:order-2">
          <div>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 text-5xl shadow-md ring-2 ring-amber-400/50">
              🏆
            </div>
            <div className="mt-4 text-xs font-black tracking-widest text-amber-700 uppercase">
              QUÁN QUÂN · {DEFAULT_PRIZES.first.title}
            </div>
            <h4 className="mt-1 min-h-[44px] text-2xl font-black text-slate-900">
              {team1?.name || '— Đang thi đấu —'}
            </h4>
            {(team1?.p1 || team1?.p2) && (
              <p className="text-sm font-bold text-amber-900">
                {[team1.p1, team1.p2].filter(Boolean).join(' & ')}
              </p>
            )}
          </div>

          <div className="mt-6 border-t border-amber-200 pt-4">
            <div className="text-3xl font-black text-amber-700 font-mono">
              {DEFAULT_PRIZES.first.cash}
            </div>
            <div className="mt-1 text-xs font-black text-amber-800">
              {DEFAULT_PRIZES.first.extra}
            </div>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="order-3 flex flex-col justify-between rounded-2xl border border-amber-200 bg-white p-6 text-center shadow-md md:order-3 md:mt-10">
          <div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-3xl shadow-inner">
              🥉
            </div>
            <div className="mt-3 text-[10px] font-black tracking-widest text-amber-700 uppercase">
              {DEFAULT_PRIZES.third.title}
            </div>
            <h4 className="mt-1 min-h-[36px] text-lg font-black text-slate-900">
              {team3?.name || '— Chưa xác định —'}
            </h4>
            {(team3?.p1 || team3?.p2) && (
              <p className="text-xs text-amber-800 font-medium">
                {[team3.p1, team3.p2].filter(Boolean).join(' & ')}
              </p>
            )}
          </div>

          <div className="mt-5 border-t border-amber-100 pt-3">
            <div className="text-2xl font-black text-amber-700 font-mono">
              {DEFAULT_PRIZES.third.cash}
            </div>
            <div className="mt-0.5 text-xs text-slate-500 font-semibold">{DEFAULT_PRIZES.third.extra}</div>
          </div>
        </div>
      </div>

      {/* 4th Place Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-slate-800">
        <div className="flex items-center gap-3">
          <Medal className="h-6 w-6 text-slate-400" />
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-500">
              HẠNG TƯ CHUNG CUỘC
            </span>
            <div className="text-base font-bold text-slate-900">
              {team4?.name || '— Đang thi đấu trận Tranh Hạng Ba —'}
            </div>
            {(team4?.p1 || team4?.p2) && (
              <div className="text-xs text-slate-500 font-medium">
                {[team4.p1, team4.p2].filter(Boolean).join(' & ')}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-slate-600">
            Kỷ niệm chương & Tinh thần thể thao
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-xs text-slate-600">
          ✓ Dữ liệu lưu an toàn trên máy · Xuất báo cáo để lưu trữ và gửi cho các đội.
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4 text-slate-500" />
            <span>Xuất CSV</span>
          </button>
          <button
            onClick={onBackup}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Sao lưu JSON</span>
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-700 shadow-sm"
          >
            <Printer className="h-4 w-4" />
            <span>In bảng kết quả</span>
          </button>
        </div>
      </div>
    </div>
  );
};
