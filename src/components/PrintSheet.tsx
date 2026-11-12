import React from 'react';
import { TournamentState } from '../types/tournament';
import { calculateStandings, determineWinner, getAwards, DEFAULT_PRIZES } from '../lib/tournament';

interface PrintSheetProps {
  state: TournamentState;
}

export const PrintSheet: React.FC<PrintSheetProps> = ({ state }) => {
  const standings = calculateStandings(
    state.teams,
    state.matches,
    state.tieOrder,
    state.tieConfirm
  );
  const awards = getAwards(state.bracket);
  const teamMap = Object.fromEntries(state.teams.map((t) => [t.id, t]));
  const getTeamName = (id?: string) => (id ? teamMap[id]?.name || '—' : '—');
  const getPlayers = (id?: string) => {
    const t = id ? teamMap[id] : null;
    return t ? [t.p1, t.p2].filter(Boolean).join(' & ') : '';
  };

  return (
    <div className="hidden print:block p-8 font-sans text-black bg-white">
      {/* Official Header */}
      <div className="border-b-2 border-black pb-4 text-center">
        <div className="text-xs font-bold tracking-widest uppercase">
          GIẢI CẦU LÔNG TRANH CÚP GIA PHÚC — LẦN I NĂM 2026
        </div>
        <h1 className="text-2xl font-black mt-1">BIÊN BẢN TỔNG KẾT VÀ TRAO GIẢI</h1>
        <div className="text-xs text-gray-700 mt-1">
          Thời gian: 20:00 · 12/11/2026 — Địa điểm: Sân Cầu Lông Gia Phúc — Thể thức: Đánh đôi
        </div>
      </div>

      {/* Podium Results */}
      <div className="mt-6 border border-black p-4">
        <h2 className="text-sm font-black tracking-wide uppercase border-b border-black pb-1">
          1. KẾT QUẢ TRAO GIẢI CHUNG CUỘC
        </h2>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
          <div className="border border-black p-2 font-bold">
            <div className="text-xs uppercase font-black">GIẢI NHẤT (VÔ ĐỊCH)</div>
            <div className="text-sm font-black mt-1">{awards ? getTeamName(awards.first) : '—'}</div>
            <div className="text-[10px] text-gray-600">{awards ? getPlayers(awards.first) : ''}</div>
            <div className="mt-1 text-xs">{DEFAULT_PRIZES.first.cash} + Cúp + HCV</div>
          </div>
          <div className="border border-black p-2 font-bold">
            <div className="text-xs uppercase font-black">GIẢI NHÌ (Á QUÂN)</div>
            <div className="text-sm font-black mt-1">{awards ? getTeamName(awards.second) : '—'}</div>
            <div className="text-[10px] text-gray-600">{awards ? getPlayers(awards.second) : ''}</div>
            <div className="mt-1 text-xs">{DEFAULT_PRIZES.second.cash} + HCB</div>
          </div>
          <div className="border border-black p-2 font-bold">
            <div className="text-xs uppercase font-black">GIẢI BA</div>
            <div className="text-sm font-black mt-1">{awards ? getTeamName(awards.third) : '—'}</div>
            <div className="text-[10px] text-gray-600">{awards ? getPlayers(awards.third) : ''}</div>
            <div className="mt-1 text-xs">{DEFAULT_PRIZES.third.cash} + HCĐ</div>
          </div>
          <div className="border border-black p-2 font-bold">
            <div className="text-xs uppercase font-black">HẠNG TƯ</div>
            <div className="text-sm font-black mt-1">{awards ? getTeamName(awards.fourth) : '—'}</div>
            <div className="text-[10px] text-gray-600">{awards ? getPlayers(awards.fourth) : ''}</div>
            <div className="mt-1 text-xs">Kỷ niệm chương</div>
          </div>
        </div>
      </div>

      {/* Standings Table */}
      <div className="mt-6 border border-black p-4">
        <h2 className="text-sm font-black tracking-wide uppercase border-b border-black pb-1">
          2. BẢNG XẾP HẠNG VÒNG NGOÀI (16 TRẬN)
        </h2>
        <table className="mt-3 w-full border-collapse border border-black text-[11px] text-left">
          <thead>
            <tr className="bg-gray-100 font-bold border-b border-black">
              <th className="border border-black p-1 text-center w-8">Hạng</th>
              <th className="border border-black p-1">Đội thi đấu</th>
              <th className="border border-black p-1">Vận động viên</th>
              <th className="border border-black p-1 text-center">Trận</th>
              <th className="border border-black p-1 text-center">Thắng/Thua</th>
              <th className="border border-black p-1 text-center">Điểm ghi (PF)</th>
              <th className="border border-black p-1 text-center">Điểm thua (PA)</th>
              <th className="border border-black p-1 text-center">Hiệu số</th>
              <th className="border border-black p-1 text-center font-black">Điểm thưởng</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((r, i) => (
              <tr key={r.id} className="border-b border-black">
                <td className="border border-black p-1 text-center font-bold">{i + 1}</td>
                <td className="border border-black p-1 font-bold">{r.name}</td>
                <td className="border border-black p-1 text-[10px]">{getPlayers(r.id)}</td>
                <td className="border border-black p-1 text-center">{r.played}/{r.scheduled}</td>
                <td className="border border-black p-1 text-center">{r.wins} - {r.losses}</td>
                <td className="border border-black p-1 text-center">{r.pf}</td>
                <td className="border border-black p-1 text-center">{r.pa}</td>
                <td className="border border-black p-1 text-center font-mono font-bold">
                  {r.diff}
                </td>
                <td className="border border-black p-1 text-center font-black">{r.bonus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Knockout Match Scores */}
      {state.bracket && (
        <div className="mt-6 border border-black p-4">
          <h2 className="text-sm font-black tracking-wide uppercase border-b border-black pb-1">
            3. KẾT QUẢ VÒNG LOẠI TRỰC TIẾP
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
            <div className="border border-black p-2">
              <div className="font-bold border-b border-black pb-1">BÁN KẾT</div>
              <div className="mt-1">
                BK1: {getTeamName(state.bracket.games.sf1?.a)} ({state.bracket.games.sf1?.sa}) vs{' '}
                {getTeamName(state.bracket.games.sf1?.b)} ({state.bracket.games.sf1?.sb})
              </div>
              <div className="mt-1">
                BK2: {getTeamName(state.bracket.games.sf2?.a)} ({state.bracket.games.sf2?.sa}) vs{' '}
                {getTeamName(state.bracket.games.sf2?.b)} ({state.bracket.games.sf2?.sb})
              </div>
            </div>
            <div className="border border-black p-2">
              <div className="font-bold border-b border-black pb-1">CHUNG KẾT & TRANH BA</div>
              <div className="mt-1">
                CK: {getTeamName(state.bracket.games.final?.a)} ({state.bracket.games.final?.sa}) vs{' '}
                {getTeamName(state.bracket.games.final?.b)} ({state.bracket.games.final?.sb})
              </div>
              <div className="mt-1">
                Hạng 3: {getTeamName(state.bracket.games.third?.a)} ({state.bracket.games.third?.sa}) vs{' '}
                {getTeamName(state.bracket.games.third?.b)} ({state.bracket.games.third?.sb})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signatures */}
      <div className="mt-8 grid grid-cols-2 text-center text-xs">
        <div>
          <div className="font-bold uppercase">ĐẠI DIỆN TỔ TRỌNG TÀI</div>
          <div className="mt-16 text-gray-500">(Ký và ghi rõ họ tên)</div>
        </div>
        <div>
          <div className="font-bold uppercase">TRƯỞNG BAN TỔ CHỨC GIẢI</div>
          <div className="mt-16 text-gray-500">(Ký và ghi rõ họ tên)</div>
        </div>
      </div>
    </div>
  );
};
