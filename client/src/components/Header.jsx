import React from 'react';
import { Bike, Cloud, CloudOff, Languages, Moon, RefreshCw, Server, Sun } from 'lucide-react';

export default function Header({
  theme,
  onToggleTheme,
  lang,
  onToggleLanguage,
  t,
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
            <h1 className="brand-title">{t('appTitle')}</h1>
            <p className="brand-subtitle">{t('appSubtitle')}</p>
          </div>
        </div>

        <div className="header-controls">
          {/* Dual Language Switcher */}
          <button
            type="button"
            className="glass-pill"
            onClick={onToggleLanguage}
            title={lang === 'en' ? 'தமிழில் மாற்றவும்' : 'Switch to English'}
            style={{
              fontWeight: 700,
              background: 'rgba(34, 211, 238, 0.12)',
              borderColor: 'rgba(34, 211, 238, 0.45)'
            }}
          >
            <Languages size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

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
                <span>{t('cloudOffline')}</span>
              </>
            ) : (
              <>
                <CloudOff size={14} style={{ color: 'var(--accent-amber)' }} />
                <span>{t('offlineStorage')}</span>
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
            <span>{syncing ? t('syncing') : t('sync')}</span>
          </button>

          <button
            type="button"
            className="glass-pill"
            onClick={onOpenSettings}
            title="Configure Render Backend URL & Storage"
          >
            <Server size={14} />
            <span>{t('server')}</span>
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
