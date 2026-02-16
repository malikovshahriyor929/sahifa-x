import { MdBookmark, MdGroup, MdMenuBook, MdSettings } from "react-icons/md";

const tabs = [
  { name: "Mening asarlarim", icon: <MdMenuBook className="text-xl" />, active: true },
  { name: "Saqlanganlar", icon: <MdBookmark className="text-xl" />, active: false },
  { name: "Obunalar", icon: <MdGroup className="text-xl" />, active: false },
  { name: "Sozlamalar", icon: <MdSettings className="text-xl" />, active: false },
];

export default function Tabs() {
  return (
    <div className="overflow-x-auto border-b border-primary-light/20">
      <nav aria-label="Tabs" className="-mb-px flex min-w-max space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            type="button"
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
              tab.active
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

