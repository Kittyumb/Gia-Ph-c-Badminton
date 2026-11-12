import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Upload,
  Settings,
  Printer,
  FileSpreadsheet,
  ChevronDown,
  Lock,
  KeyRound,
  X,
  RefreshCw,
  RotateCcw,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { StagePage } from '../types/tournament';

interface HeaderProps {
  currentPage: StagePage;
  onNavigate: (page: StagePage) => void;
  onBackup: () => void;
  onRestore: () => void;
  onExportCsv: () => void;
  onPrint: () => void;
  onSyncNow?: () => void;
  onResetScores?: () => void;
  currentUser?: User | null;
  onLoginGoogle?: () => void;
  onLogoutGoogle?: () => void;
}

const BTC_PASSCODE = '643332';

export const Header: React.FC<HeaderProps> = ({
  currentPage: _currentPage,
  onNavigate,
  onBackup,
  onRestore,
  onExportCsv,
  onPrint,
  onSyncNow,
  onResetScores,
  currentUser,
  onLoginGoogle,
  onLogoutGoogle,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);

  // Close menu whenever clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Focus input when PIN modal opens
  useEffect(() => {
    if (showPinModal) {
      setPinInput('');
      setPinError(false);
      setTimeout(() => pinInputRef.current?.focus(), 80);
    }
  }, [showPinModal]);

  const handleBtcButtonClick = () => {
    if (menuOpen) {
      setMenuOpen(false);
    } else {
      setShowPinModal(true);
    }
  };

  const handleVerifyPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput.trim() === BTC_PASSCODE) {
      setShowPinModal(false);
      setPinError(false);
      setMenuOpen(true);
    } else {
      setPinError(true);
    }
  };

  const handleAction = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  return (
    <>
      <header className="mb-3 flex items-center justify-between gap-2.5 border-b border-slate-200 bg-white px-3 sm:px-4 py-2.5 rounded-xl shadow-xs">
        {/* Brand & Tournament Name */}
        <div className="flex items-center gap-2.5 shrink-0 min-w-0">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-lg sm:text-xl shadow-xs">
            🏸
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 whitespace-nowrap">
              Gia Phúc Cup 2026
            </h1>
          </div>
        </div>

        {/* Công cụ BTC (Requires passcode 643332) */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={handleBtcButtonClick}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 sm:px-3 py-1.5 text-xs font-bold shadow-xs transition active:scale-95 shrink-0 ${
              menuOpen
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Lock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span className="whitespace-nowrap">Công cụ BTC</span>
            <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 text-xs space-y-1">
              {/* Google BTC Account Section */}
              <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-2 text-xs">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  <span>Tài khoản Google BTC</span>
                  {currentUser?.email && (
                    <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-bold text-[9px]">
                      {currentUser.email === 'kittyumbs.tmd.047@gmail.com' || currentUser.email === 'nuttency@gmail.com'
                        ? 'Super Admin'
                        : 'Admin'}
                    </span>
                  )}
                </div>

                {currentUser ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="" className="h-6 w-6 rounded-full shrink-0" />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shrink-0">
                          {currentUser.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <p className="text-[11px] font-bold text-slate-800 truncate" title={currentUser.email || ''}>
                        {currentUser.email}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAction(onLogoutGoogle || (() => {}))}
                      className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline pt-0.5"
                    >
                      <LogOut className="h-3 w-3" />
                      <span>Đăng xuất / Đổi tài khoản khác</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAction(onLoginGoogle || (() => {}))}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 py-2 text-xs font-bold text-white shadow-2xs transition"
                  >
                    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
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

              <div className="px-2 pt-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Quản lý & Dữ liệu</span>
                <span className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono text-[10px]">
                  Cloud Sync
                </span>
              </div>

              {onSyncNow && (
                <button
                  type="button"
                  onClick={() => handleAction(onSyncNow)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-slate-700 hover:bg-slate-50 font-medium transition"
                >
                  <RefreshCw className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Đồng bộ ngay với Cloud</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleAction(onBackup)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-slate-700 hover:bg-slate-50 font-medium transition"
              >
                <Download className="h-4 w-4 text-slate-500 shrink-0" />
                <span>Sao lưu dữ liệu (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction(onRestore)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-slate-700 hover:bg-slate-50 font-medium transition"
              >
                <Upload className="h-4 w-4 text-slate-500 shrink-0" />
                <span>Khôi phục từ file</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction(onExportCsv)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-slate-700 hover:bg-slate-50 font-medium transition"
              >
                <FileSpreadsheet className="h-4 w-4 text-slate-500 shrink-0" />
                <span>Xuất kết quả (CSV)</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction(onPrint)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-slate-700 hover:bg-slate-50 font-medium transition"
              >
                <Printer className="h-4 w-4 text-slate-500 shrink-0" />
                <span>In biên bản A4</span>
              </button>

              {onResetScores && (
                <button
                  type="button"
                  onClick={() => handleAction(onResetScores)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-rose-700 hover:bg-rose-50 font-semibold transition"
                >
                  <RotateCcw className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>Reset điểm giải đấu</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleAction(() => onNavigate('settings'))}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-slate-700 hover:bg-slate-50 font-medium border-t border-slate-100 transition"
              >
                <Settings className="h-4 w-4 text-slate-500 shrink-0" />
                <span>Cài đặt đội & sân</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* In-app PIN code authentication modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                  <KeyRound className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Mã bảo vệ Ban tổ chức</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleVerifyPin} className="mt-4 space-y-3">
              <p className="text-xs text-slate-600">
                Vui lòng nhập mã bảo vệ BTC để mở danh mục Công cụ BTC:
              </p>

              <div>
                <input
                  ref={pinInputRef}
                  type="password"
                  inputMode="numeric"
                  maxLength={10}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError(false);
                  }}
                  placeholder="Nhập mã PIN BTC"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-center font-mono text-lg tracking-widest outline-none transition ${
                    pinError
                      ? 'border-rose-400 bg-rose-50 text-rose-900 focus:ring-2 focus:ring-rose-400'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                />
                {pinError && (
                  <p className="mt-1.5 text-center text-xs font-semibold text-rose-600">
                    Mã bảo vệ không đúng. Vui lòng nhập lại!
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-700 shadow-sm"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
