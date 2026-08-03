const TABS = [
  { id: "home", label: "خانه" },
  { id: "translator", label: "ترجمه" },
  { id: "summarizer", label: "خلاصه‌سازی" },
  { id: "chat", label: "چت" },
  { id: "text-classifier", label: "دسته‌بندی متن" },
];

export default function TabBar({ active, onChange }) {
  return (
    <nav className="tabbar">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`tab ${active === t.id ? "active" : ""}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
