import { useState, useEffect } from 'react';
import { WEEKDAYS, loadCategories, saveCategories, loadTheme, saveTheme, applyTheme, DEFAULT_CATEGORIES, APP_VERSION, CHANGELOG } from './utils';
import RecordTab from './components/RecordTab';
import ListTab from './components/ListTab';
import MonthlyTab from './components/MonthlyTab';
import SettingsModal from './components/SettingsModal';
import OnboardingModal from './components/OnboardingModal';

function App() {
  const [activeTab, setActiveTab] = useState('record');
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('activity_records');
    return saved ? JSON.parse(saved) : [];
  });
  const [categories, setCategories] = useState(() => loadCategories());
  const [headerDate, setHeaderDate] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [gasUrl, setGasUrl] = useState(() => localStorage.getItem('gas_webapp_url') || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = loadTheme();
    applyTheme(saved);
    return saved;
  });
  const [appTitle, setAppTitle] = useState(
    () => localStorage.getItem('app_title') || '📓 LogNote'
  );
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [whatsNewLog, setWhatsNewLog] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1') return true;
    return !localStorage.getItem('onboarding_complete');
  });

  useEffect(() => {
    console.log('App Version: 2.0.0 (Customizable Categories)'); // Debug for deployment
    const now = new Date();
    const wd = WEEKDAYS[now.getDay()];
    setHeaderDate(`${now.getMonth() + 1}月${now.getDate()}日（${wd}）`);

    // Check for setup magic link
    const params = new URLSearchParams(window.location.search);
    const setupGas = params.get('setup_gas');
    if (setupGas) {
      if (window.confirm('設定を引き継ぎますか？')) {
        localStorage.setItem('gas_webapp_url', setupGas);
        setGasUrl(setupGas);
        alert('✅ 設定を完了しました！');
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
    // Check for new version (skip if onboarding not yet done)
    if (localStorage.getItem('onboarding_complete')) {
      const seenVersion = localStorage.getItem('seen_version');
      if (seenVersion !== APP_VERSION) {
        const seenIdx = CHANGELOG.findIndex(c => c.version === seenVersion);
        const newEntries = seenIdx === -1 ? CHANGELOG : CHANGELOG.slice(0, seenIdx);
        if (newEntries.length > 0) {
          setWhatsNewLog(newEntries);
          setShowWhatsNew(true);
        }
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('activity_records', JSON.stringify(records));
  }, [records]);

  // Sync to GAS when records change (Debounced to avoid too many requests)
  useEffect(() => {
    if (!gasUrl || records.length === 0) return;

    const timer = setTimeout(() => {
      syncToGas(records);
    }, 2000); // 2 seconds debounce

    return () => clearTimeout(timer);
  }, [records, gasUrl]);

  // Initial Fetch
  useEffect(() => {
    if (gasUrl) {
      fetchFromGas();
    }
  }, [gasUrl]);

  const syncToGas = async (currentRecords) => {
    if (!gasUrl) return;
    setIsSyncing(true);
    console.log('[GAS] Syncing to:', gasUrl);

    // Use text/plain to avoid CORS preflight and allow simple request
    const payload = JSON.stringify(currentRecords);

    try {
      await fetch(gasUrl, {
        method: 'POST',
        // mode: 'no-cors', // standard fetch should work if GAS returns correct headers, but let's try 'no-cors' with plain text
        // actually, GAS Web App *redirects* which fetch follows.
        // Let's try standard fetch first, but with text/plain to avoid complex CORS
        headers: { 'Content-Type': 'text/plain' },
        body: payload
      });
      console.log('[GAS] Sync request sent');
    } catch (e) {
      console.error('[GAS] Sync failed:', e);
      // In no-cors or successful redirect, we might not catch error here unless network fails
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchFromGas = async () => {
    if (!gasUrl) return;
    setIsSyncing(true);
    console.log('[GAS] Fetching from:', gasUrl);
    try {
      const res = await fetch(gasUrl);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      console.log('[GAS] Data received:', data);

      // Handle both old format (array) and new format (object with records + spreadsheetUrl)
      const fetchedRecords = Array.isArray(data) ? data : data.records;

      if (Array.isArray(fetchedRecords) && fetchedRecords.length > 0) {
        fetchedRecords.forEach(r => {
          if (r.count) r.count = parseInt(r.count);
        });
        // Ensure fetched data is sorted (Newest first) to match App logic
        fetchedRecords.sort((a, b) => {
          const dateA = (a.date || '') + (a.time || '');
          const dateB = (b.date || '') + (b.time || '');
          return dateA > dateB ? -1 : 1;
        });

        setRecords(fetchedRecords);
        console.log('[GAS] Local records updated from SpreadSheet');
      } else {
        console.log('[GAS] No data in SpreadSheet or empty array');
      }

      // Save spreadsheet URL if available
      if (data.spreadsheetUrl) {
        localStorage.setItem('spreadsheet_url', data.spreadsheetUrl);
      }
    } catch (e) {
      console.error('[GAS] Fetch failed:', e);
      // Don't alert on fetch fail to avoid annoying popup on load, just log
    } finally {
      setIsSyncing(false);
    }
  };

  const addRecord = (record) => {
    const newRecords = [...records, record];
    newRecords.sort((a, b) => `${a.date}${a.time}` > `${b.date}${b.time}` ? -1 : 1);
    setRecords(newRecords);
  };

  const updateRecord = (updatedRecord) => {
    const newRecords = records.map(r => r.id === updatedRecord.id ? updatedRecord : r);
    newRecords.sort((a, b) => `${a.date}${a.time}` > `${b.date}${b.time}` ? -1 : 1);
    setRecords(newRecords);
  };

  const deleteRecord = (id) => {
    if (!window.confirm('この記録を削除しますか？')) return;
    setRecords(records.filter(r => r.id !== id));
  };

  const bulkDeleteRecords = (ids) => {
    if (window.confirm(`${ids.length}件の記録を削除しますか？`)) {
      setRecords(records.filter(r => !ids.includes(r.id)));
    }
  };

  const handleImportCompleted = () => {
    // Called when import is done in settings. Fetch fresh data.
    fetchFromGas();
  };

  // Reset: clear all local data and disconnect GAS
  const handleReset = () => {
    setRecords([]);
    setGasUrl('');
    setCategories(DEFAULT_CATEGORIES);
    setAppTitle('📓 LogNote');
    applyTheme('forest');
    saveTheme('forest');
    setCurrentTheme('forest');
    setShowOnboarding(true);
    localStorage.removeItem('activity_records');
    localStorage.removeItem('gas_webapp_url');
    localStorage.removeItem('spreadsheet_url');
    localStorage.removeItem('custom_categories');
    localStorage.removeItem('app_title');
    localStorage.removeItem('app_theme');
    localStorage.removeItem('output_options');
    localStorage.removeItem('onboarding_complete');
    localStorage.removeItem('seen_version');
    console.log('[App] Reset complete: all local data cleared');

  };

  const handleCategoriesChange = (newCategories) => {
    setCategories(newCategories);
    saveCategories(newCategories);
  };

  const handleThemeChange = (themeKey) => {
    applyTheme(themeKey);
    saveTheme(themeKey);
    setCurrentTheme(themeKey);
  };

  // Responsive check
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      // If switching to desktop and on record tab, switch to list (since record is side-panel)
      if (desktop && activeTab === 'record') {
        setActiveTab('list');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  return (
    <>
      <div className="header">
        <div className="header-top">
          <div>
            <div className="app-title">{appTitle}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isSyncing && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>⟳ Sync...</span>}
            <div className="header-date">{headerDate}</div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'rgba(255,255,255,0.8)', padding: 0 }}
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>

      <div className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'record' ? 'active' : ''}`}
          onClick={() => setActiveTab('record')}
          data-tab="record"
        >
          ✏️ 記録
        </button>
        <button
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
          data-tab="list"
        >
          📋 一覧
        </button>
        <button
          className={`tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
          data-tab="monthly"
        >
          📊 月報
        </button>
      </div>

      <div className="main">
        {/* Record Panel: Visible if tab is record OR if on desktop (side panel) */}
        <div className="panel-record" style={{ display: (activeTab === 'record' || isDesktop) ? 'block' : 'none' }}>
          <RecordTab onAdd={addRecord} gasUrl={gasUrl} categories={categories} />
        </div>

        {/* Content Panel: Visible if tab is NOT record OR if on desktop (main panel) */}
        <div className="panel-content" style={{ display: (activeTab !== 'record' || isDesktop) ? 'block' : 'none' }}>
          {(activeTab === 'list' || (isDesktop && activeTab === 'record')) && (
            <ListTab
              records={records}
              onUpdate={updateRecord}
              onDelete={deleteRecord}
              onBulkDelete={bulkDeleteRecords}
              categories={categories}
            />
          )}
          {activeTab === 'monthly' && (
            <MonthlyTab records={records} categories={categories} />
          )}
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveUrl={(url) => { setGasUrl(url); }}
        onImportCompleted={handleImportCompleted}
        onReset={handleReset}
        gasUrl={gasUrl}
        categories={categories}
        onCategoriesChange={handleCategoriesChange}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        appTitle={appTitle}
        onTitleChange={(title) => {
          setAppTitle(title);
          localStorage.setItem('app_title', title);
        }}
      />

      {/* Onboarding (first time only) */}
      {showOnboarding && (
        <OnboardingModal
          onComplete={() => {
            localStorage.setItem('onboarding_complete', '1');
            localStorage.setItem('seen_version', APP_VERSION);
            setShowOnboarding(false);
          }}
          onCategoriesChange={handleCategoriesChange}
          onThemeChange={handleThemeChange}
          onSaveUrl={(url) => setGasUrl(url)}
          currentTheme={currentTheme}
        />
      )}

      {/* What's New Modal */}
      {showWhatsNew && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--cream)', borderRadius: '16px', padding: '24px',
            maxWidth: '420px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            maxHeight: '80vh', overflowY: 'auto'
          }}>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--forest)', marginBottom: '4px' }}>
              🆕 アップデート情報
            </div>
            <div style={{ fontSize: '11px', color: '#999', marginBottom: '16px' }}>v{APP_VERSION}</div>
            {whatsNewLog.map(entry => (
              <div key={entry.version} style={{ marginBottom: '16px' }}>
                <div style={{
                  fontSize: '13px', fontWeight: 'bold',
                  color: 'var(--moss)', marginBottom: '6px',
                  borderBottom: '1px solid var(--mist)', paddingBottom: '4px'
                }}>
                  v{entry.version} <span style={{ fontWeight: 'normal', color: '#aaa', fontSize: '11px' }}>({entry.date})</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', listStyle: 'none' }}>
                  {entry.items.map((item, i) => (
                    <li key={i} style={{ fontSize: '13px', color: 'var(--ink)', marginBottom: '6px', lineHeight: '1.5' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <button
              onClick={() => {
                localStorage.setItem('seen_version', APP_VERSION);
                setShowWhatsNew(false);
              }}
              style={{
                width: '100%', padding: '12px',
                background: 'var(--forest)', color: 'white',
                border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              確認しました
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;