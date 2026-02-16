import { MdHistory } from "react-icons/md";
import type { Activity } from "../types";

type ActivityFeedProps = {
  activities: Activity[];
};

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="rounded-2xl border border-primary-light/25 bg-white p-5">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-dark-900">
        <MdHistory className="text-xl text-primary" />
        Oxirgi faoliyat
      </h3>

      <div className="relative space-y-5 pl-4 before:absolute before:bottom-2 before:left-1.5 before:top-2 before:w-px before:bg-primary-light/30">
        {activities.map((activity) => (
          <div key={activity.id} className="relative">
            <div
              className={`absolute -left-[18px] top-1.5 size-2.5 rounded-full ring-4 ring-white ${activity.dotColor}`}
            />
            <p className="text-sm text-dark-900/75">{activity.text}</p>
            <span className="mt-1 block text-xs text-dark-900/50">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

