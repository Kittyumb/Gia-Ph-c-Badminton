import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, UserCheck } from 'lucide-react';
import { Match } from '../types/tournament';

interface RefereeModalProps {
  isOpen: boolean;
  match: Match | null;
  courtName: string;
  teamAName: string;
  teamBName: string;
  currentReferee?: string;
  onConfirm: (refereeName: string) => void;
  onCancel: () => void;
}

export const RefereeModal: React.FC<RefereeModalProps> = ({
  isOpen,
  match,
  courtName,
  teamAName,
  teamBName,
  currentReferee = '',
  onConfirm,
  onCancel,
}) => {
  const [refereeName, setRefereeName] = useState(currentReferee);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRefereeName(currentReferee);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, currentReferee]);

  if (!isOpen || !match) return null;

  const matchNum = match.slot + (match.court === 2 ? 8 : 0);
  const isValid = Boolean(refereeName.trim());

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isValid) return;
    onConfirm(refereeName.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Simple Header without explanations */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <UserCheck className="h-4 w-4" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              Nhập tên trọng tài
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Compact Match Badge */}
        <div className="my-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-2.5 text-center text-xs font-bold text-slate-800">
          <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-black text-white mr-2 uppercase">
            {courtName}
          </span>
          <span className="text-slate-700">Trận {matchNum} (Lượt {match.slot}):</span>{' '}
          <span className="text-emerald-700 font-black">{teamAName}</span>
          <span className="mx-1 text-slate-400 font-normal">vs</span>
          <span className="text-amber-700 font-black">{teamBName}</span>
        </div>

        {/* Simple Form - Mandatory input, no skipping */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Họ và tên trọng tài: <span className="text-rose-500">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              required
              value={refereeName}
              onChange={(e) => setRefereeName(e.target.value)}
              placeholder="Nhập tên trọng tài..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Action buttons: Only Hủy & Vào ghi điểm (Bỏ qua removed) */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-700 shadow-md shadow-emerald-700/20 disabled:opacity-40 transition active:scale-95"
            >
              <span>Vào ghi điểm</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
