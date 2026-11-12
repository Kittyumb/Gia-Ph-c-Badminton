import { createFileRoute } from "@tanstack/react-router";
import tournamentHtml from "@/lib/gia-phuc-cup-app.html?raw";
import tournamentDesign from "@/lib/gia-phuc-cup-redesign.css?raw";
import tournamentTokens from "@/lib/gia-phuc-cup-tokens.css?raw";
import trophyPhoto from "@/assets/gia-phuc-cup-trophy.jpg?url";

const redesignedAppHtml = tournamentHtml
  .replace(
    "</style></head>",
    `</style><style>${tournamentTokens}\n${tournamentDesign.replaceAll("__TROPHY_PHOTO__", trophyPhoto)}</style></head>`,
  )
  .replace(
    /<section class="hero">[\s\S]*?<\/section>/,
    `<section class="hero" aria-label="Gia Phúc Cup 2026">
      <div class="hero-copy">
        <div class="eyebrow">GIẢI CẦU LÔNG TRANH CÚP · LẦN I</div>
        <h1>Gia Phúc Cup <span>2026</span></h1>
        <p class="hero-note">Một mùa giải. Những trận cầu đáng nhớ.</p>
        <div class="hero-meta">
          <span>20:00 · 12/11/2026</span>
          <span>Sân cầu lông Gia Phúc</span>
          <span>Đánh đôi · 2 sân</span>
        </div>
      </div>
      <div class="hero-edition" aria-hidden="true"><span>MÙA GIẢI ĐẦU TIÊN</span><strong>I</strong><span>12 · 11 · 2026</span></div>
    </section>`,
  );

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Gia Phúc Cup 2026 — Bảng điều hành giải cầu lông" },
      {
        name: "description",
        content:
          "Bảng điều hành Giải cầu lông tranh cúp Gia Phúc 2026: theo dõi lịch thi đấu, nhập điểm, xếp hạng và kết quả trực tiếp.",
      },
      { property: "og:title", content: "Gia Phúc Cup 2026 — Bảng điều hành" },
      {
        property: "og:description",
        content: "Lịch đấu, bảng điểm và hành trình tranh cúp Gia Phúc 2026.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  return (
    <main className="min-h-dvh bg-background">
      <iframe
        className="block h-dvh min-h-[640px] w-full border-0"
        title="Bảng điều hành Giải cầu lông Gia Phúc Cup 2026"
        srcDoc={redesignedAppHtml}
        allow="clipboard-write"
      />
    </main>
  );
}
