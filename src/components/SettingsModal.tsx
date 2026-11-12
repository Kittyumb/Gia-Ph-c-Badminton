import React, { useRef } from 'react';
import { Team, Match, TournamentState } from '../types/tournament';
import {
  Users,
  Grid,
  Database,
  Plus,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Cloud,
  CheckCircle2,
  Wifi,
  LogOut,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface SettingsModalProps {
  state: TournamentState;
  teamsMap: Record<string, Team>;
  onUpdateTeam: (id: string, updates: Partial<Team>) => void;
  onAddTeam: () => void;
  onRemoveTeam: (id: string) => void;
  onUpdateCourtName: (index: number, name: string) => void;
  onUpdateMatchPair: (matchId: string, side: 'a' | 'b', teamId: string) => void;
  onRegenerateSchedule: () => void;
  onSeedDemoScores: () => void;
  onBackup: () => void;
  onRestoreFile: (file: File) => void;
  onResetScores?: () => void;
  onResetAll: () => void;
  onTabChange: (tab: 'teams' | 'courts' | 'data') => void;
  onBackToMatch: () => void;
  cloudStatus?: 'connected' | 'syncing' | 'offline' | 'error';
  savedTime?: string;
  lastUpdatedBy?: string;
  onSyncNow?: () => void;
  currentUser?: User | null;
  onLoginGoogle?: () => void;
  onLogoutGoogle?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  state,
  teamsMap,
  onUpdateTeam,
  onAddTeam,
  onRemoveTeam,
  onUpdateCourtName,
  onUpdateMatchPair,
  onRegenerateSchedule,
  onSeedDemoScores,
  onBackup,
  onRestoreFile,
  onResetScores,
  onResetAll,
  onTabChange,
  onBackToMatch,
  cloudStatus = 'connected',
  savedTime = 'Vừa xong',
  lastUpdatedBy,
  onSyncNow,
  currentUser,
  onLoginGoogle,
  onLogoutGoogle,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6 text-slate-900">
      {/* Settings Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <div className="text-[10px] font-black tracking-widest text-emerald-700 uppercase">
            BAN TỔ CHỨC / CÀI ĐẶT HỆ THỐNG
          </div>
          <h3 className="text-xl font-black text-slate-900">Thiết lập giải đấu & Dữ liệu</h3>
          <p className="mt-1 text-xs text-slate-600">
            Quản lý danh sách đội đánh đôi, tên sân, phân bổ lịch đấu và đồng bộ trực tiếp Cloud Firestore.
          </p>
        </div>

        <button
          onClick={onBackToMatch}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          ← Quay lại bàn điều hành
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => onTabChange('teams')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm ${
            state.settingTab === 'teams'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Danh sách đội ({state.teams.length})</span>
        </button>

        <button
          onClick={() => onTabChange('courts')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm ${
            state.settingTab === 'courts'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Grid className="h-4 w-4" />
          <span>Sân & Cặp đấu</span>
        </button>

        <button
          onClick={() => onTabChange('data')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm ${
            state.settingTab === 'data'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Database className="h-4 w-4" />
          <span>Cơ sở dữ liệu & Sao lưu</span>
        </button>
      </div>

      {/* Tab 1: Teams List Management */}
      {state.settingTab === 'teams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600">
              Chỉnh sửa tên cặp đấu hoặc họ tên từng vận động viên thi đấu đôi:
            </p>
            <button
              onClick={onAddTeam}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm đội</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {state.teams.map((t, idx) => (
              <div
                key={t.id}
                className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-[11px] font-black text-emerald-800">
                    {idx + 1}
                  </span>
                  {state.teams.length > 4 && (
                    <button
                      onClick={() => onRemoveTeam(t.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Xóa đội"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Tên đội</label>
                    <input
                      type="text"
                      value={t.name}
                      onChange={(e) => onUpdateTeam(t.id, { name: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">VĐV 1</label>
                    <input
                      type="text"
                      placeholder="Họ và tên VĐV 1"
                      value={t.p1 || ''}
                      onChange={(e) => onUpdateTeam(t.id, { p1: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs text-slate-800 focus:border-emerald-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">VĐV 2</label>
                    <input
                      type="text"
                      placeholder="Họ và tên VĐV 2"
                      value={t.p2 || ''}
                      onChange={(e) => onUpdateTeam(t.id, { p2: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs text-slate-800 focus:border-emerald-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Courts & Match Pairings */}
      {state.settingTab === 'courts' && (
        <div className="space-y-6">
          {/* Court Names */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900">Tên các sân thi đấu</h4>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {state.courts.map((courtName, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 w-16">Sân {idx + 1}:</span>
                  <input
                    type="text"
                    value={courtName}
                    onChange={(e) => onUpdateCourtName(idx, e.target.value)}
                    placeholder={`Sân ${idx + 1}`}
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Regenerate schedule */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Tự động chia lịch thi đấu ({state.matches.length} trận)
                </h4>
                <p className="mt-1 text-xs text-slate-600">
                  Thuật toán xoay tua tròn đảm bảo mỗi đội thi đấu 4 trận cân bằng đối thủ trên 2 sân.
                </p>
              </div>
              <button
                onClick={onRegenerateSchedule}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 shadow-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Tạo lại 16 trận cân bằng</span>
              </button>
            </div>

            {/* List of pairings to customize */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[1, 2].map((courtNum) => {
                const courtMatches = state.matches.filter((m) => m.court === courtNum);
                return (
                  <div key={courtNum} className="space-y-2">
                    <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      {state.courts[courtNum - 1] || `Sân ${courtNum}`} ({courtMatches.length} trận)
                    </div>
                    {courtMatches.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs"
                      >
                        <span className="w-12 font-mono font-bold text-slate-500 text-[11px]">
                          {m.id.toUpperCase()}
                        </span>

                        <select
                          value={m.a}
                          onChange={(e) => onUpdateMatchPair(m.id, 'a', e.target.value)}
                          className="flex-1 rounded-xl border border-slate-300 bg-white p-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
                        >
                          <option value="">— Chọn đội A —</option>
                          {state.teams.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>

                        <span className="text-[10px] font-bold text-slate-400">VS</span>

                        <select
                          value={m.b}
                          onChange={(e) => onUpdateMatchPair(m.id, 'b', e.target.value)}
                          className="flex-1 rounded-xl border border-slate-300 bg-white p-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
                        >
                          <option value="">— Chọn đội B —</option>
                          {state.teams.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cloud Database & Backup Management */}
      {state.settingTab === 'data' && (
        <div className="space-y-4">
          {/* Cloud Database Status Card */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm text-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Cloud className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Cơ sở dữ liệu đám mây Cloud Firestore
                  </h4>
                  <p className="text-xs text-emerald-900">
                    Đồng bộ thời gian thực đa thiết bị (Điện thoại trọng tài, màn hình lớn, khán giả).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 px-3 py-1 rounded-xl shadow-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{cloudStatus === 'connected' ? 'Đã kết nối trực tiếp' : 'Ngoại tuyến'}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Tài liệu giải đấu:
                </span>
                <span className="font-mono font-bold text-slate-800">gia-phuc-cup-2026</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Lần lưu gần nhất:
                </span>
                <span className="font-bold text-emerald-800">{savedTime}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Cập nhật bởi:
                </span>
                <span className="font-semibold text-slate-700 truncate block">
                  {lastUpdatedBy || 'Hệ thống điều hành'}
                </span>
              </div>
            </div>

            {/* Google Account Authentication Section */}
            <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Tài khoản Google Ban tổ chức
                    </span>
                    {currentUser?.email ? (
                      <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                        ✓ Đã đăng nhập
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-bold">
                        Chưa đăng nhập
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    {currentUser?.email ? (
                      <span>
                        Đang đăng nhập: <strong className="text-slate-800">{currentUser.email}</strong>{' '}
                        {currentUser.email === 'kittyumbs.tmd.047@gmail.com' ||
                        currentUser.email === 'nuttency@gmail.com' ? (
                          <span className="text-emerald-700 font-bold">(Super Admin · Đầy đủ quyền)</span>
                        ) : (
                          <span className="text-slate-500">(Tài khoản BTC)</span>
                        )}
                      </span>
                    ) : (
                      <span>
                        Đăng nhập tài khoản Google (ví dụ: <strong className="text-emerald-800">kittyumbs.tmd.047@gmail.com</strong>) để cấp quyền quản trị và đồng bộ dữ liệu đám mây.
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {currentUser ? (
                    <button
                      type="button"
                      onClick={onLogoutGoogle}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition"
                    >
                      <LogOut className="h-3.5 w-3.5 text-slate-500" />
                      <span>Đăng xuất / Đổi tài khoản</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onLoginGoogle}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-black text-white shadow-xs transition"
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Đăng nhập Google (Tài khoản BTC)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {onSyncNow && (
              <div className="mt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={onSyncNow}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-700 shadow-sm"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Đồng bộ ngay với Cloud Firestore</span>
                </button>
              </div>
            )}
          </div>

          {/* Local File Backup & Restore */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="text-base font-bold text-slate-900">Sao lưu & Khôi phục file (Offline Backup)</h4>
            <p className="mt-1 text-xs text-slate-600">
              Bạn có thể tải file JSON dự phòng để lưu về USB hoặc chuyển giao dữ liệu sang thiết bị khác mà không cần mạng.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={onBackup}
                className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-black text-white hover:bg-slate-900 shadow-sm"
              >
                <Download className="h-4 w-4" />
                <span>Tải file sao lưu JSON</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                <Upload className="h-4 w-4" />
                <span>Khôi phục từ file JSON</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onRestoreFile(file);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>

          {/* Quick simulation seed for training / test */}
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-slate-900 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-700" />
              <h4 className="text-sm font-bold text-slate-900">Nạp điểm thi đấu mẫu (Demo)</h4>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Hữu ích để tập dượt, xem trước giao diện bảng xếp hạng, bán kết và bục trao giải với
              16 trận vòng ngoài đã hoàn thành thực tế.
            </p>
            <div className="mt-3">
              <button
                onClick={onSeedDemoScores}
                className="flex items-center gap-1.5 rounded-xl border border-amber-400 bg-white px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 shadow-xs"
              >
                <span>Nạp tỷ số mẫu đầy đủ 16 trận</span>
              </button>
            </div>
          </div>

          {/* Danger zone: Reset tournament */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-slate-900 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
              <h4 className="text-sm font-bold text-slate-900">Vùng quản trị · Reset & Đặt lại giải đấu</h4>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Bạn có thể chỉ xóa điểm số thi đấu để bắt đầu lượt đấu mới mà không mất danh sách đội, hoặc khởi tạo lại giải đấu mới hoàn toàn.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {onResetScores && (
                <button
                  type="button"
                  onClick={onResetScores}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-400 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold shadow-xs transition"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset điểm giải đấu (Giữ nguyên đội & cài đặt)</span>
                </button>
              )}

              <button
                type="button"
                onClick={onResetAll}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-xs transition"
              >
                <Trash2 className="h-4 w-4 text-slate-400" />
                <span>Khởi tạo giải đấu mới hoàn toàn (Xóa cả đội)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
