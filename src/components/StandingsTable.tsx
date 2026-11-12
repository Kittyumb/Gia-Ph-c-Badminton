import React from 'react';
import { StandingRow, TieGroup, Team, Match } from '../types/tournament';
import { ArrowUp, ArrowDown, Check, ShieldCheck, Trophy, AlertCircle, FileSpreadsheet } from 'lucide-react';

interface StandingsTableProps {
  standings: StandingRow[];
  tieGroups: TieGroup[];
  allOuterFinished: boolean;
  hasBracket: boolean;
  teamsMap: Record<string, Team>;
  matches: Match[];
  onTieMove: (sig: string, id: string, dir: -1 | 1) => void;
  onConfirmTie: (sig: string) => void;
  onSeedTop4: () => void;
  onResetBracket: () => void;
  onExportCsv: () => void;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  standings,
  tieGroups,
  allOuterFinished,
  hasBracket,
  teamsMap,
  matches,
  onTieMove,
  onConfirmTie,
  onSeedTop4,
  onResetBracket,
  onExportCsv,
}) => {
  return (
    <div className="space-y-5 text-slate-900">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <div className="text-[10px] font-black tracking-widest text-emerald-700 uppercase">
            FINAL 1 / BẢNG XẾP HẠNG
          </div>
          <h3 className="text-xl font-black text-slate-900">Kết quả vòng ngoài</h3>
          <p className="mt-1 text-xs text-slate-600">
            Điểm thưởng là tiêu chí 1 · Hiệu số (Tổng điểm đạt được cộng dồn) là tiêu chí 2 · Top 4 vào Bán kết.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4 text-slate-500" />
            <span>Xuất CSV</span>
          </button>

          {hasBracket ? (
            <button
              onClick={onResetBracket}
              className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100"
            >
              <span>↺ Xếp lại Bán kết</span>
            </button>
          ) : (
            <button
              onClick={onSeedTop4}
              disabled={!allOuterFinished}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-700/20 hover:bg-emerald-700 disabled:opacity-40"
            >
              <Trophy className="h-4 w-4" />
              <span>Chốt TOP 4 → Vào Bán kết</span>
            </button>
          )}
        </div>
      </div>

      {/* Tie breaker alert panel if active */}
      {tieGroups.length > 0 && (
        <div className="space-y-3">
          {tieGroups.map((g) => {
            const isResolved = g.arr[0]?.tieResolved;
            return (
              <div
                key={g.sig}
                className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 text-slate-900 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-700" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Xử lý đồng hạng: {g.arr.length} đội bằng điểm thưởng & hiệu số
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Ban tổ chức dùng nút mũi tên (↑ / ↓) để điều chỉnh vị trí và bấm xác nhận
                        để cố định hạt giống.
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      isResolved
                        ? 'border border-emerald-300 bg-emerald-100 text-emerald-800'
                        : 'border border-amber-300 bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isResolved ? '✓ BTC đã xác nhận' : '● Chưa chốt thứ tự'}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5">
                  {g.arr.map((row, idx) => (
                    <div
                      key={row.id}
                      className="flex items-center justify-between rounded-xl border border-amber-200 bg-white p-2.5 shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-xs font-black text-amber-800">
                          #{g.from + idx + 1}
                        </span>
                        <div>
                          <strong className="text-sm font-bold text-slate-900">{row.name}</strong>
                          <span className="ml-2 text-xs text-slate-500">
                            ({row.bonus} điểm thưởng · Hiệu số {row.diff >= 0 ? `+${row.diff}` : row.diff})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onTieMove(g.sig, row.id, -1)}
                          disabled={idx === 0}
                          title="Đẩy đội lên trên"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onTieMove(g.sig, row.id, 1)}
                          disabled={idx === g.arr.length - 1}
                          title="Đẩy đội xuống dưới"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onConfirmTie(g.sig)}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-black text-white hover:bg-amber-700 shadow-sm"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>✓ BTC xác nhận thứ tự này</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Standings Cards (Mobile & Compact View) */}
      <div className="space-y-2 lg:hidden">
        {standings.map((row, i) => {
          const isTop4 = i < 4;
          const team = teamsMap[row.id];

          return (
            <div
              key={row.id}
              className={`flex items-center justify-between rounded-2xl border p-3.5 transition shadow-sm ${
                isTop4
                  ? 'border-emerald-300 bg-emerald-50/70 ring-1 ring-emerald-500/20'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base font-black ${
                    isTop4 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold text-slate-900">{row.name}</span>
                    {isTop4 && (
                      <span className="rounded-full bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 text-[9px] font-black text-emerald-800 uppercase">
                        TOP 4
                      </span>
                    )}
                  </div>
                  {(team?.p1 || team?.p2) && (
                    <div className="truncate text-[11px] text-slate-500 font-medium">
                      {[team.p1, team.p2].filter(Boolean).join(' & ')}
                    </div>
                  )}
                  <div className="mt-0.5 text-[10px] text-slate-500 font-medium">
                    {row.played}/{row.scheduled} trận · {row.wins} thắng - {row.losses} thua
                  </div>
                </div>
              </div>

              {/* Stats on right */}
              <div className="flex items-center gap-3 text-right shrink-0 pl-2">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Thưởng</span>
                  <div className="font-mono text-xl font-black text-slate-900">{row.bonus}</div>
                </div>
                <div className="w-14">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Hiệu số</span>
                  <div className="font-mono text-sm font-black text-emerald-800">
                    {row.diff}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Desktop Table */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-600">
              <th className="py-3.5 pl-4 pr-2 text-center w-14">Hạng</th>
              <th className="py-3.5 px-3">Đội thi đấu & Vận động viên</th>
              <th className="py-3.5 px-3 text-center">Trận</th>
              <th className="py-3.5 px-3 text-center">Thắng</th>
              <th className="py-3.5 px-3 text-center">Thua</th>
              <th className="py-3.5 px-3 text-center">Bỏ cuộc</th>
              <th className="py-3.5 px-3 text-center">Điểm ghi (PF)</th>
              <th className="py-3.5 px-3 text-center">Điểm thua (PA)</th>
              <th className="py-3.5 px-3 text-center">Hiệu số</th>
              <th className="py-3.5 px-4 text-center font-black text-emerald-800">Điểm thưởng</th>
              <th className="py-3.5 pr-4 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {standings.map((row, i) => {
              const isTop4 = i < 4;
              const team = teamsMap[row.id];

              return (
                <tr
                  key={row.id}
                  className={`transition ${
                    isTop4
                      ? 'bg-emerald-50/40 font-semibold hover:bg-emerald-50/80'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-3 pl-4 pr-2 text-center">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${
                        isTop4
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 text-sm">{row.name}</div>
                    {(team?.p1 || team?.p2) && (
                      <div className="text-[11px] text-slate-500 font-normal">
                        {[team.p1, team.p2].filter(Boolean).join(' & ')}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                    {row.played}/{row.scheduled}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                    {row.wins}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-600">
                    {row.losses}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-amber-700">
                    {row.forfeits}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-700">{row.pf}</td>
                  <td className="py-3 px-3 text-center font-mono text-slate-700">{row.pa}</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-emerald-800">
                    {row.diff}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-lg font-black text-slate-900">
                    {row.bonus}
                  </td>
                  <td className="py-3 pr-4 text-center">
                    {isTop4 ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                        <Check className="h-3 w-3" />
                        <span>Vào Bán kết</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Educational rule note */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm">
        <h5 className="font-bold text-slate-900">Quy tắc tính điểm & xếp hạng chính thức:</h5>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px]">
          <li>
            <strong>Điểm thưởng:</strong> Thắng +2 điểm, Thua +1 điểm. Đội bỏ cuộc nhận 0 điểm, đội
            còn lại được xử thắng +2 điểm.
          </li>
          <li>
            <strong>Hiệu số:</strong> Tổng số điểm đạt được trong các trận (cộng dồn dù thắng hay thua). Đội ghi được nhiều điểm hơn sẽ xếp trên.
          </li>
          <li>
            <strong>Thứ tự ưu tiên:</strong> (1) Điểm thưởng cao hơn → (2) Hiệu số (điểm cộng dồn) cao hơn → (3)
            Nếu tiếp tục bằng nhau, Ban tổ chức xác nhận thứ hạng trực tiếp để ghép cặp Bán kết.
          </li>
        </ul>
      </div>
    </div>
  );
};
