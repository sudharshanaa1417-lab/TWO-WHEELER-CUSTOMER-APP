import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  FileSpreadsheet,
  Home,
  Search,
  UserPlus,
  Users
} from 'lucide-react';
import Header from './components/Header';
import DashboardHome from './components/DashboardHome';
import CustomerList from './components/CustomerList';
import SmartSearch from './components/SmartSearch';
import ExcelManager from './components/ExcelManager';
import CustomerFormModal from './components/CustomerFormModal';
import CustomerProfileModal from './components/CustomerProfileModal';
import SyncSettingsModal from './components/SyncSettingsModal';
import {
  DEMO_CUSTOMERS,
  getAllCustomers,
  removeCustomer,
  replaceAllCustomers,
  saveCustomer
} from './db/indexedDb';
import {
  checkServerHealth,
  deleteCustomerOnServer,
  pushCustomerToServer,
  syncWithServer
} from './db/apiSync';
import { getTranslation } from './utils/i18n';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('twf_theme') || 'aurora');
  const [lang, setLang] = useState(() => localStorage.getItem('twf_lang') || 'en');
  const [activeTab, setActiveTab] = useState('home');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [serverConnected, setServerConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState('');

  const t = useMemo(() => getTranslation(lang), [lang]);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('twf_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('twf_lang', lang);
  }, [lang]);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => {
      setIsOnline(false);
      setServerConnected(false);
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const handleSyncNow = useCallback(
    async (silent = false) => {
      setSyncing(true);
      try {
        const local = await getAllCustomers();
        const res = await syncWithServer(local);
        if (res.synced) {
          const updated = await replaceAllCustomers(res.customers);
          setCustomers(updated);
          setServerConnected(true);
          if (!silent) showToast(lang === 'ta' ? 'சர்வரோடு ஒத்திசைக்கப்பட்டது' : 'Synced with Render server & saved offline');
        } else {
          setServerConnected(false);
          if (!silent) showToast(lang === 'ta' ? 'ஆஃப்லைன் சேமிப்பு முறையில் இயங்குகிறது' : 'Running in Offline Local Storage mode');
        }
      } finally {
        setSyncing(false);
      }
    },
    [showToast, lang]
  );

  useEffect(() => {
    let active = true;
    async function bootstrap() {
      const local = await getAllCustomers();
      if (!active) return;
      setCustomers(local);
      setLoading(false);

      const health = await checkServerHealth();
      if (!active) return;
      setServerConnected(health.ok);
      if (health.ok) {
        const res = await syncWithServer(local);
        if (active && res.synced) {
          const updated = await replaceAllCustomers(res.customers);
          setCustomers(updated);
        }
      }
    }
    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  async function handleSaveCustomer(payload) {
    const isEdit = Boolean(editingCustomer?.id);
    const saved = await saveCustomer(payload);
    setCustomers((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      if (exists) return prev.map((c) => (c.id === saved.id ? saved : c));
      return [saved, ...prev];
    });
    setFormOpen(false);
    setEditingCustomer(null);
    if (selectedCustomer?.id === saved.id) {
      setSelectedCustomer(saved);
    }
    showToast(
      isEdit
        ? lang === 'ta'
          ? 'வாடிக்கையாளர் விவரங்கள் புதுப்பிக்கப்பட்டன'
          : 'Customer profile updated'
        : lang === 'ta'
        ? 'புதிய வாடிக்கையாளர் ஆஃப்லைனில் சேமிக்கப்பட்டார்'
        : 'New customer saved offline'
    );

    pushCustomerToServer(saved, isEdit).then((ok) => {
      if (ok) setServerConnected(true);
    });
  }

  async function handleUpdatePayment(id, updatedCustomer) {
    const saved = await saveCustomer(updatedCustomer);
    setCustomers((prev) => prev.map((c) => (c.id === id ? saved : c)));
    if (selectedCustomer?.id === id) {
      setSelectedCustomer(saved);
    }
    pushCustomerToServer(saved, true).then((ok) => {
      if (ok) setServerConnected(true);
    });
  }

  async function handleDeleteCustomer(id) {
    await removeCustomer(id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setSelectedCustomer(null);
    showToast(lang === 'ta' ? 'வாடிக்கையாளர் நீக்கப்பட்டார்' : 'Customer deleted from local storage');
    deleteCustomerOnServer(id);
  }

  async function handleImportCustomers(rows, mode) {
    let nextList;
    if (mode === 'replace') {
      nextList = await replaceAllCustomers(rows);
    } else {
      const byVehicle = new Map(
        customers.map((c) => [String(c.vehicleNumber).toUpperCase(), c])
      );
      for (const r of rows) {
        const key = String(r.vehicleNumber || '').toUpperCase();
        if (key && byVehicle.has(key)) {
          const prev = byVehicle.get(key);
          byVehicle.set(key, { ...prev, ...r, id: prev.id, createdAt: prev.createdAt });
        } else {
          byVehicle.set(key || r.id, r);
        }
      }
      nextList = await replaceAllCustomers(Array.from(byVehicle.values()));
    }

    setCustomers(nextList);
    showToast(
      lang === 'ta'
        ? `${rows.length} வாடிக்கையாளர் தகவல்கள் இறக்குமதி செய்யப்பட்டன`
        : `Imported ${rows.length} customer records`
    );
    syncWithServer(nextList).then((res) => {
      if (res.synced) setServerConnected(true);
    });
  }

  async function handleResetDemo() {
    const seeded = await replaceAllCustomers(DEMO_CUSTOMERS);
    setCustomers(seeded);
    setSettingsOpen(false);
    showToast(lang === 'ta' ? 'மாதிரி வாடிக்கையாளர் தகவல்கள் ஏற்றப்பட்டன' : 'Loaded sample TN 15 customer data');
  }

  async function handleClearAll() {
    const empty = await replaceAllCustomers([]);
    setCustomers(empty);
    setSettingsOpen(false);
    showToast(lang === 'ta' ? 'அனைத்து தகவல்களும் அழிக்கப்பட்டன' : 'Local offline database cleared');
  }

  return (
    <>
      {/* Ambient Liquid Prism Background */}
      <div className="aurora-canvas" aria-hidden="true">
        <div className="aurora-orb aurora-orb--1" />
        <div className="aurora-orb aurora-orb--2" />
        <div className="aurora-orb aurora-orb--3" />
      </div>

      <main className="app-shell">
        <Header
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'aurora' ? 'frost' : 'aurora'))}
          lang={lang}
          onToggleLanguage={() => setLang((l) => (l === 'en' ? 'ta' : 'en'))}
          t={t}
          isOnline={isOnline}
          serverConnected={serverConnected}
          syncing={syncing}
          onSyncNow={() => handleSyncNow(false)}
          onOpenSettings={() => setSettingsOpen(true)}
          onGoHome={() => setActiveTab('home')}
        />

        {loading ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
            {lang === 'ta' ? 'ஆஃப்லைன் தகவல்கள் ஏற்றப்படுகின்றன...' : 'Loading offline customer database...'}
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <DashboardHome
                customers={customers}
                onNavigate={setActiveTab}
                onOpenAdd={() => {
                  setEditingCustomer(null);
                  setFormOpen(true);
                }}
                onSelectCustomer={setSelectedCustomer}
                t={t}
              />
            )}

            {activeTab === 'customers' && (
              <CustomerList
                customers={customers}
                onSelectCustomer={setSelectedCustomer}
                onOpenAdd={() => {
                  setEditingCustomer(null);
                  setFormOpen(true);
                }}
                t={t}
              />
            )}

            {activeTab === 'search' && (
              <SmartSearch
                customers={customers}
                onSelectCustomer={setSelectedCustomer}
                t={t}
              />
            )}

            {activeTab === 'excel' && (
              <ExcelManager
                customers={customers}
                onImportCustomers={handleImportCustomers}
                onNotify={showToast}
                t={t}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Android-Style Glass Navigation Dock */}
      <nav className="bottom-dock-wrap" aria-label="Bottom Navigation">
        <div className="bottom-dock">
          <button
            type="button"
            className={`dock-item ${activeTab === 'home' ? 'dock-item--active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Home size={18} />
            <span>{t('tabHome')}</span>
          </button>

          <button
            type="button"
            className={`dock-item ${activeTab === 'customers' ? 'dock-item--active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <Users size={18} />
            <span>{t('tabCustomers')}</span>
          </button>

          <button
            type="button"
            className="dock-item"
            onClick={() => {
              setEditingCustomer(null);
              setFormOpen(true);
            }}
          >
            <UserPlus size={18} />
            <span>{t('tabAdd')}</span>
          </button>

          <button
            type="button"
            className={`dock-item ${activeTab === 'search' ? 'dock-item--active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <Search size={18} />
            <span>{t('tabSearch')}</span>
          </button>

          <button
            type="button"
            className={`dock-item ${activeTab === 'excel' ? 'dock-item--active' : ''}`}
            onClick={() => setActiveTab('excel')}
          >
            <FileSpreadsheet size={18} />
            <span>{t('tabExcel')}</span>
          </button>
        </div>
      </nav>

      {/* Add / Edit Customer Modal */}
      <CustomerFormModal
        isOpen={formOpen}
        initialCustomer={editingCustomer}
        onClose={() => {
          setFormOpen(false);
          setEditingCustomer(null);
        }}
        onSave={handleSaveCustomer}
        t={t}
      />

      {/* Full Customer Profile Modal with Real-time Due Months Payment Update */}
      <CustomerProfileModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onEdit={(cust) => {
          setSelectedCustomer(null);
          setEditingCustomer(cust);
          setFormOpen(true);
        }}
        onDelete={handleDeleteCustomer}
        onUpdatePayment={handleUpdatePayment}
        onNotify={showToast}
        t={t}
      />

      {/* Offline Storage & Render Sync Settings Modal */}
      <SyncSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onResetDemo={handleResetDemo}
        onClearAll={handleClearAll}
        onSyncNow={() => handleSyncNow(false)}
        customerCount={customers.length}
      />

      {/* Toast Banner */}
      {toast && (
        <div className="glass-panel-elevated toast-banner" role="status">
          <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} />
          <span>{toast}</span>
        </div>
      )}
    </>
  );
}
