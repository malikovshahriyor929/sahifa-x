import { MdBookmark, MdGroup, MdMenuBook, MdSettings } from "react-icons/md";

export type ProfileTabId = "my-books" | "saved-books" | "subscriptions" | "settings";

const tabs: { id: ProfileTabId; name: string; icon: React.ReactNode }[] = [
  { id: "my-books", name: "Mening asarlarim", icon: <MdMenuBook className="text-xl" /> },
  { id: "saved-books", name: "Saqlanganlar", icon: <MdBookmark className="text-xl" /> },
  { id: "subscriptions", name: "Obunalar", icon: <MdGroup className="text-xl" /> },
  { id: "settings", name: "Sozlamalar", icon: <MdSettings className="text-xl" /> },
];

type TabsProps = {
  value: ProfileTabId;
  onChange: (tab: ProfileTabId) => void;
};

export default function Tabs({ value, onChange }: TabsProps) {
  return (
    <div className="overflow-x-auto border-b border-primary-light/20">
      <nav aria-label="Tabs" className="-mb-px flex min-w-max space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
              tab.id === value
                ? "border-primary text-primary"
                : "border-transparent text-dark-900/50 hover:border-primary/35 hover:text-dark-900/75"
            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
}
