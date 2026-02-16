type SidebarRightProps = {
  authorNote: string;
  authorAvatar: string;
};

export function SidebarRight({ authorNote, authorAvatar }: SidebarRightProps) {
  return (
    <aside className="pointer-events-none absolute bottom-6 right-6 top-6 z-10 hidden w-72 flex-col gap-4 xl:flex">
      <div className="pointer-events-auto rounded-2xl border border-primary-light/20 bg-white p-5 shadow-xl shadow-black/10">
        <h3 className="mb-3 text-sm font-bold text-dark-900">Muallifdan izoh</h3>
        <div className="flex items-start gap-3">
          <div className="size-10 shrink-0 overflow-hidden rounded-full border border-primary-light/20">
            {/* eslint-disable-next-line @next/next/no-img-element -- Remote URLs are dynamic from API payload. */}
            <img src={authorAvatar} alt="Author" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="mb-2 text-xs leading-relaxed text-dark-900/70 italic">{authorNote}</p>
            <button
              type="button"
              className="text-xs font-bold text-primary transition-colors hover:text-primary-light hover:underline"
            >
              Davomini o&apos;qish
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
