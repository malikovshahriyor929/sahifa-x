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

      <div className="space-y-0">
        {activities.map((activity, index) => {
          const isLast = index === activities.length - 1;

          return (
            <div
              key={activity.id}
              className={`relative grid grid-cols-[20px_minmax(0,1fr)] gap-3 ${isLast ? "" : "pb-4"}`}
            >
              <div className="relative flex justify-center">
                <div className={`mt-1 size-4 rounded-full border-4 border-white shadow-sm ${activity.dotColor}`} />
                {!isLast ? (
                  <div className="absolute left-1/2 top-7 h-[calc(100%-20px)] w-px -translate-x-1/2 bg-primary-light/30" />
                ) : null}
              </div>

              <div>
                <p className="text-sm leading-6 text-dark-900/75">{activity.text}</p>
                <span className="mt-1 block text-xs text-dark-900/50">{activity.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
