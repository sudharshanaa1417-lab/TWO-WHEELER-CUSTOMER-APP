import React from 'react';
import { Bike, Cloud, CloudOff, Moon, RefreshCw, Server, Sun } from 'lucide-react';

export default function Header({
  theme,
  onToggleTheme,
  isOnline,
  serverConnected,
  syncing,
  onSyncNow,
  onOpenSettings,
  onGoHome
}) {
  return (
    <header className="glass-panel app-header">
      <div className="header-top-row">
        <div
          className="brand-lockup"
          onClick={onGoHome}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onGoHome()}
          style={{ cursor: 'pointer' }}
        >
          <div className="brand-emblem" aria-hidden="true">
            <Bike size={28} strokeWidth={2.1} />
          </div>
          <div>
            <h1 className="brand-title">TWO WHEELER FINANCE</h1>
            <p className="brand-subtitle">Customer Management System</p>
          </div>
        </div>

        <div className="header-controls">
          <span
            className={`glass-pill ${serverConnected ? 'glass-pill--active' : ''}`}
            title={
              serverConnected
                ? 'Connected to Render Backend + Offline IndexedDB'
                : 'Running 100% Offline with Local IndexedDB Storage'
            }
          >
            {isOnline && serverConnected ? (
              <>
                <Cloud size={14} style={{ color: 'var(--accent-emerald)' }} />
                <span>Cloud + Offline</span>
              </>
            ) : (
              <>
                <CloudOff size={14} style={{ color: 'var(--accent-amber)' }} />
                <span>Offline Storage</span>
              </>
            )}
          </span>

          <button
            type="button"
            className="glass-pill"
            onClick={onSyncNow}
            disabled={syncing}
            title="Sync local storage with Render server"
          >
            <RefreshCw size={14} className={syncing ? 'spin-icon' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync'}</span>
          </button>

          <button
            type="button"
            className="glass-pill"
            onClick={onOpenSettings}
            title="Configure Render Backend URL & Storage"
          >
            <Server size={14} />
            <span>Server</span>
          </button>

          <button
            type="button"
            className="glass-pill"
            onClick={onToggleTheme}
            title="Switch Glassmorphism Theme"
          >
            {theme === 'aurora' ? <Sun size={14} /> : <Moon size={14} />}
            <span>{theme === 'aurora' ? 'Frost' : 'Aurora'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
