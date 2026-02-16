import Link from "next/link";
import { MdEmojiEvents } from "react-icons/md";
import type { Achievement } from "../types";

type AchievementsProps = {
  items: Achievement[];
  locale: string;
};

export default function Achievements({ items, locale }: AchievementsProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary-light/25 bg-white p-5">
      <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-dark-900">
          <MdEmojiEvents className="text-xl text-primary" />
          Yutuqlar
        </h3>
        <Link href={`/${locale}/profile`} className="text-xs font-bold text-primary hover:underline">
          Barchasi
        </Link>
      </div>

      <div className="relative z-10 space-y-3.5">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 rounded-xl border border-primary-light/20 p-3 ${
              item.opacity ? "bg-primary/5 opacity-60" : "bg-primary/10"
            }`}
          >
            <div
              className={`flex size-10 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm ${item.colorClass}`}
            >
              {item.icon}
            </div>
            <div>
              <h4 className={`text-sm font-bold ${item.opacity ? "text-dark-900/55" : "text-dark-900"}`}>
                {item.title}
              </h4>
              <p className={`text-[11px] ${item.opacity ? "text-dark-900/45" : "text-dark-900/55"}`}>
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

