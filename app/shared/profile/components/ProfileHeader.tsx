import { MdCameraAlt, MdEdit, MdShare } from "react-icons/md";
import type { ProfileUser } from "../types";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

type ProfileHeaderProps = {
  user: ProfileUser;
};

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <section className="relative w-full overflow-hidden rounded-[24px] border border-primary-light/25 bg-white shadow-xl shadow-black/10">
      <div className="relative h-40 w-full bg-gradient-to-r from-[#edf8f8] via-[#e5f5f5] to-[#d9f0f0]">
        <div className="absolute inset-0 bg-halftone opacity-15" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.6),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(20,179,181,0.14),transparent_50%)]" />
        <div className="absolute bottom-0 h-24 w-full bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="relative z-10 -mt-12 flex flex-col gap-6 px-6 pb-8 md:flex-row md:items-end md:px-8">
        <div className="relative shrink-0">
          <div className="size-32 rounded-full border-4 border-white bg-primary-light/15 p-1 shadow-xl shadow-primary/10">
            <div
              className="size-full rounded-full bg-cover bg-center"
              style={{ backgroundImage: `url('${user.avatarUrl}')` }}
            />
          </div>
          <button
            type="button"
            className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full bg-primary text-white shadow-md transition-colors hover:bg-primary-dark"
            title="Avatarni almashtirish"
          >
            <MdCameraAlt size={18} />
          </button>
        </div>

        <div className="mb-2 w-full flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-bold text-dark-900">{user.name}</h2>
            {user.isPremium ? <Badge variant="premium">Premium</Badge> : null}
            <Badge variant="default">{user.role}</Badge>
          </div>
          <p className="mb-2 text-sm text-dark-900/60">@{user.handle}</p>
          <p className="mb-4 max-w-2xl text-sm leading-relaxed text-dark-900/70">{user.bio}</p>

          <div className="flex items-center gap-6 md:gap-10">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-dark-900">{user.stats.works}</span>
              <span className="text-xs font-semibold uppercase text-dark-900/55">
                Asarlar
              </span>
            </div>
            <div className="h-8 w-px bg-primary-light/30" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-dark-900">{user.stats.followers}</span>
              <span className="text-xs font-semibold uppercase text-dark-900/55">
                Kuzatuvchilar
              </span>
            </div>
            <div className="h-8 w-px bg-primary-light/30" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-dark-900">{user.stats.likes}</span>
              <span className="text-xs font-semibold uppercase text-dark-900/55">
                Layklar
              </span>
            </div>
          </div>
        </div>

        <div className="mb-2 mt-4 flex w-full items-center gap-3 md:mt-0 md:w-auto">
          <Button
            variant="secondary"
            icon={<MdShare />}
            className="flex-1 border-primary-light/40 bg-white text-dark-900 hover:bg-primary/5 md:flex-none"
          >
            Ulashish
          </Button>
          <Button variant="primary" icon={<MdEdit />} className="flex-1 md:flex-none">
            Profilni tahrirlash
          </Button>
        </div>
      </div>
    </section>
  );
}
