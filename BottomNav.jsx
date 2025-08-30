import React from 'react';

export default function BottomNav({ tab, setTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'add', label: 'Add', icon: '➕' },
    { id: 'history', label: 'History', icon: '🧾' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];
  return (
    <nav className="tabs" role="tablist" aria-label="Bottom Navigation">
      {tabs.map(t => (
        <button
          key={t.id}
          className={`tab ${tab===t.id ? 'active' : ''}`}
          onClick={() => setTab(t.id)}
          aria-current={tab===t.id ? 'page' : undefined}
        >
          <div className="icon" aria-hidden>{t.icon}</div>
          <div className="small">{t.label}</div>
        </button>
      ))}
    </nav>
  );
}