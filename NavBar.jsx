const TABS = [
  { id: 'tap', label: 'Mine', icon: '⛏️' },
  { id: 'boost', label: 'Power', icon: '🚀' },
  { id: 'shop', label: 'Boost', icon: '✨' },
  { id: 'checkin', label: 'Egg', icon: '🥚' },
  { id: 'wallet', label: 'Wallet', icon: '💎' },
];

export default function NavBar({ active, onChange }) {
  return (
    <nav className="nav">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={'nav-item' + (active === t.id ? ' active' : '')}
          onClick={() => onChange(t.id)}
        >
          <span className="nav-icon">{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
