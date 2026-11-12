import React from 'react';
import { Calendar, MapPin, Users, Trophy } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <section
      aria-label="Gia Phúc Cup 2026"
      className="relative mb-5 overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 shadow-md text-white"
    >
      {/* Background trophy image with subtle sports overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity filter contrast-125"
        style={{
          backgroundImage: `url('/assets/aistudio/gia-phuc-cup-trophy_ae3a690c.jpg')`,
          backgroundPosition: 'right 25% center',
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/80 to-transparent" />

      <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/20 px-3 py-1 text-[11px] font-black tracking-wider text-amber-300 uppercase">
            <Trophy className="h-3.5 w-3.5 text-amber-300" />
            GIẢI CẦU LÔNG TRANH CÚP · LẦN I
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
            Gia Phúc Cup <span className="text-amber-400">2026</span>
          </h2>
          <p className="mt-1.5 text-sm text-emerald-100/90 sm:text-base font-medium">
            Một mùa giải kịch tính. Những pha cầu đỉnh cao và tinh thần fair-play.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-emerald-100/90 font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-amber-300" />
              <span>20:00 · Thứ Năm, 12/11/2026</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-amber-300" />
              <span>Sân cầu lông Gia Phúc</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-amber-300" />
              <span>Đánh đôi nam nữ/nam · 2 sân thi đấu</span>
            </div>
          </div>
        </div>

        {/* Edition emblem */}
        <div className="hidden shrink-0 flex-col items-center justify-center rounded-full border-2 border-amber-300/40 bg-white/10 p-4 text-center backdrop-blur-md sm:flex sm:h-28 sm:w-28 shadow-lg">
          <span className="text-[9px] font-black tracking-widest text-emerald-200 uppercase">
            MÙA GIẢI
          </span>
          <span className="font-serif text-3xl font-bold text-amber-300">I</span>
          <span className="text-[9px] font-bold text-emerald-200">12 · 11 · 2026</span>
        </div>
      </div>
    </section>
  );
};
