import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { CATEGORY_PRESETS, DEFAULT_CATEGORIES, THEMES } from '../utils';

function SettingsModal({ isOpen, onClose, onSaveUrl, onImportCompleted, onReset, gasUrl: propGasUrl, categories, onCategoriesChange, currentTheme, onThemeChange, appTitle, onTitleChange }) {
    const [url, setUrl] = useState('');
    const [showQr, setShowQr] = useState(false);

    // Category Editor State
    const [showCategoryEditor, setShowCategoryEditor] = useState(false);
    const [editCategories, setEditCategories] = useState([]);
    const [newCatName, setNewCatName] = useState('');
    const [newCatIcon, setNewCatIcon] = useState('📌');

    useEffect(() => {
        // Sync with prop or localStorage
        const saved = localStorage.getItem('gas_webapp_url');
        setUrl(saved || propGasUrl || '');
    }, [isOpen, propGasUrl]);

    useEffect(() => {
        if (isOpen && categories) {
            setEditCategories(categories.map(c => ({ ...c })));
        }
    }, [isOpen, categories]);

    if (!isOpen) return null;

    const handleSave = () => {
        const cleanUrl = url.trim();
        localStorage.setItem('gas_webapp_url', cleanUrl);
        onSaveUrl(cleanUrl);
        onClose();
    };

    const magicLink = `${window.location.origin}${window.location.pathname}?setup_gas=${encodeURIComponent(url)}`;

    // Use the saved URL for import, falling back to state
    const targetUrl = propGasUrl || url;

    // Category Handlers
    const commonEmojis = ['📌', '🚶', '🤝', '🎪', '📝', '🗂️', '🌿', '💼', '🚗', '📖', '✏️', '🏃', '💰', '🎓', '🏠', '💻', '📞', '🎨', '🔧', '📊'];

    const handleAddCategory = () => {
        const name = newCatName.trim();
        if (!name) { alert('カテゴリ名を入力してください'); return; }
        if (editCategories.some(c => c.name === name)) { alert('同じ名前のカテゴリがすでに存在します'); return; }
        if (editCategories.length >= 10) { alert('カテゴリは最大10個までです'); return; }
        setEditCategories([...editCategories, { name, icon: newCatIcon }]);
        setNewCatName('');
        setNewCatIcon('📌');
    };

    const handleRemoveCategory = (index) => {
        if (editCategories.length <= 1) { alert('カテゴリは最低1つ必要です'); return; }
        setEditCategories(editCategories.filter((_, i) => i !== index));
    };

    const handleApplyPreset = (presetKey) => {
        const preset = CATEGORY_PRESETS[presetKey];
        if (preset && window.confirm(`「${preset.label}」プリセットに変更しますか？\n現在のカテゴリは上書きされます。`)) {
            setEditCategories(preset.categories.map(c => ({ ...c })));
        }
    };

    const handleSaveCategories = () => {
        if (editCategories.length === 0) { alert('カテゴリは最低1つ必要です'); return; }
        onCategoriesChange(editCategories);
        setShowCategoryEditor(false);
    };

    return (
        <div className="modal-overlay" style={{
            display: 'flex', position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.45)', alignItems: 'flex-end', justifyContent: 'center'
        }} onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
            <div style={{
                background: 'white', width: '100%', maxWidth: '400px', borderRadius: '20px 20px 0 0',
                padding: '24px 20px 36px', boxShadow: '0 -4px 30px rgba(0,0,0,0.15)',
                maxHeight: '85vh', overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontFamily: "'Shippori Mincho',serif", fontSize: '18px', color: 'var(--forest)', margin: 0 }}>
                        ⚙️ 設定 (Google連携)
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#aaa', cursor: 'pointer', padding: '0 8px' }}>✕</button>
                </div>

                <label>GAS WebアプリのURL</label>
                <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    style={{ marginBottom: '8px', width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    inputMode="url"
                />
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '20px', lineHeight: '1.5' }}>
                    ※ GoogleスプレッドシートのGASスクリプトで設定してください。<br />
                    <a href="./help.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--forest)', textDecoration: 'underline' }}>
                        👉 詳しい設定手順はこちら（図解）
                    </a>
                </div>

                {url && (
                    <div style={{ marginBottom: '20px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        <button
                            onClick={() => setShowQr(!showQr)}
                            style={{ background: 'none', border: 'none', color: 'var(--forest)', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px' }}
                        >
                            {showQr ? 'QRコードを隠す' : '📲 スマホ連携用QRコードを表示'}
                        </button>
                        {showQr && (
                            <div style={{ marginTop: '15px', padding: '10px', background: '#fff', borderRadius: '8px' }}>
                                <QRCodeCanvas value={magicLink} size={200} />
                                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                                    このQRコードをスマホで読み取ると、<br />設定が自動で引き継がれます。
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-primary" onClick={handleSave} style={{ flex: 1 }}>設定を保存</button>
                </div>

                {url && (
                    <button
                        className="btn-secondary"
                        onClick={() => {
                            const spreadsheetUrl = localStorage.getItem('spreadsheet_url');
                            if (spreadsheetUrl) {
                                window.open(spreadsheetUrl, '_blank');
                            } else if (targetUrl) {
                                // Fallback: fetch from GAS to get spreadsheet URL
                                fetch(targetUrl)
                                    .then(r => r.json())
                                    .then(data => {
                                        if (data.spreadsheetUrl) {
                                            localStorage.setItem('spreadsheet_url', data.spreadsheetUrl);
                                            window.open(data.spreadsheetUrl, '_blank');
                                        } else {
                                            alert('スプレッドシートURLを取得できませんでした。\nデータを一度読み込んでから再度お試しください。');
                                        }
                                    })
                                    .catch(() => {
                                        alert('通信エラーが発生しました。\nGAS URLが正しいか確認してください。');
                                    });
                            } else {
                                alert('GAS WebアプリのURLを先に設定してください。');
                            }
                        }}
                        style={{ width: '100%', marginTop: '12px', fontSize: '13px' }}
                    >
                        📊 スプレッドシートを開く
                    </button>
                )}

                {/* ── App Title Section ── */}
                <div style={{ marginTop: '24px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
                    <h4 style={{ margin: '0 0 10px', color: 'var(--forest)', fontSize: '14px' }}>📱 アプリ名</h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            value={appTitle}
                            onChange={(e) => onTitleChange(e.target.value)}
                            placeholder="📓 LogNote"
                            style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1.5px solid rgba(45,90,61,0.2)', fontSize: '14px', marginBottom: 0 }}
                            maxLength={20}
                        />
                        <button
                            onClick={() => onTitleChange('📓 LogNote')}
                            style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #ddd', background: '#f8f8f8', fontSize: '12px', color: '#888', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >リセット</button>
                    </div>
                </div>

                {/* ── Theme Selector Section ── */}
                <div style={{ marginTop: '24px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
                    <h4 style={{ margin: '0 0 12px', color: 'var(--forest)', fontSize: '14px' }}>🎨 テーマ設定</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                        {Object.entries(THEMES).map(([key, theme]) => {
                            const isActive = currentTheme === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => onThemeChange(key)}
                                    style={{
                                        position: 'relative',
                                        padding: '10px 4px 8px',
                                        borderRadius: '12px',
                                        border: isActive ? '2px solid var(--forest)' : '2px solid #e0e0e0',
                                        background: isActive ? 'var(--mist)' : '#fafafa',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.2s',
                                        boxShadow: isActive ? '0 0 0 2px var(--leaf)' : 'none',
                                    }}
                                >
                                    {isActive && (
                                        <span style={{
                                            position: 'absolute', top: '2px', right: '4px',
                                            fontSize: '9px', color: 'var(--forest)', fontWeight: 'bold'
                                        }}>✓</span>
                                    )}
                                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{theme.emoji}</div>
                                    <div style={{ fontSize: '9px', color: '#666', lineHeight: 1.2 }}>{theme.label}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Category Editor Section ── */}
                <div style={{ marginTop: '30px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, color: 'var(--soil)', fontSize: '14px' }}>🏷️ カテゴリ設定</h4>
                        <button onClick={() => setShowCategoryEditor(!showCategoryEditor)}
                            style={{ background: 'none', border: 'none', color: 'var(--forest)', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px' }}
                        >{showCategoryEditor ? '閉じる' : '編集する'}</button>
                    </div>

                    {!showCategoryEditor ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {categories && categories.map(c => (
                                <span key={c.name} style={{
                                    padding: '4px 10px', background: '#f4f7f6', borderRadius: '12px',
                                    fontSize: '13px', color: 'var(--forest)'
                                }}>{c.icon} {c.name}</span>
                            ))}
                        </div>
                    ) : (
                        <div>
                            {/* Presets */}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>プリセットから選択：</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {Object.entries(CATEGORY_PRESETS).map(([key, preset]) => (
                                        <button key={key} onClick={() => handleApplyPreset(key)}
                                            style={{
                                                padding: '4px 10px', fontSize: '12px', borderRadius: '12px',
                                                border: '1px solid #ddd', background: '#fafafa', cursor: 'pointer', color: '#555'
                                            }}
                                        >{preset.label}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Current Categories List */}
                            <div style={{ marginBottom: '4px' }}>
                                <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '6px', paddingLeft: '4px' }}>
                                    📊 = 月報に件数を表示するカテゴリ
                                </div>
                                {editCategories.map((cat, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '6px 8px', borderBottom: '1px solid #f0f0f0'
                                    }}>
                                        <span style={{ fontSize: '18px', width: '28px', textAlign: 'center' }}>{cat.icon}</span>
                                        <span style={{ flex: 1, fontSize: '14px' }}>{cat.name}</span>
                                        <button
                                            onClick={() => {
                                                const updated = editCategories.map((c, j) =>
                                                    j === i ? { ...c, countStat: !c.countStat } : c
                                                );
                                                setEditCategories(updated);
                                            }}
                                            title="月報の集計対象に含める"
                                            style={{
                                                padding: '2px 6px', fontSize: '12px', borderRadius: '4px',
                                                border: cat.countStat ? '1px solid var(--forest)' : '1px solid #ddd',
                                                background: cat.countStat ? 'var(--forest)' : '#fafafa',
                                                color: cat.countStat ? 'white' : '#bbb',
                                                cursor: 'pointer',
                                            }}
                                        >📊</button>
                                        <button onClick={() => handleRemoveCategory(i)}
                                            style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '16px', padding: '2px 6px' }}
                                            title="削除"
                                        >✕</button>
                                    </div>
                                ))}
                            </div>

                            {/* Add New Category */}
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '12px' }}>
                                <select value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)}
                                    style={{ width: '50px', padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px', textAlign: 'center' }}
                                >
                                    {commonEmojis.map(e => (
                                        <option key={e} value={e}>{e}</option>
                                    ))}
                                </select>
                                <input type="text" placeholder="新しいカテゴリ名"
                                    value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); }}
                                    style={{ flex: 1, padding: '6px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }}
                                    lang="ja" inputMode="text"
                                />
                                <button onClick={handleAddCategory}
                                    style={{
                                        padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--forest)',
                                        background: 'var(--forest)', color: 'white', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap'
                                    }}
                                >追加</button>
                            </div>

                            <button className="btn-primary" onClick={handleSaveCategories}
                                style={{ width: '100%', fontSize: '13px' }}
                            >カテゴリを保存する</button>
                        </div>
                    )}
                </div>

                {url && (
                    <div style={{ marginTop: '30px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
                        <h4 style={{ margin: '0 0 10px', color: 'var(--soil)', fontSize: '14px' }}>📥 カレンダーから取り込み</h4>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                            Googleカレンダーの過去の予定を、このアプリに取り込みます。<br />
                            <span style={{ color: '#d32f2f' }}>※ 重複して取り込まれる可能性があります。</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                            <input type="date" id="importStart" defaultValue="2025-06-01" style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }} />
                            <span style={{ alignSelf: 'center' }}>～</span>
                            <input type="date" id="importEnd" defaultValue={new Date().toISOString().split('T')[0]} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }} />
                        </div>
                        <button
                            className="btn-secondary"
                            style={{ width: '100%', fontSize: '13px' }}
                            onClick={async () => {
                                if (!window.confirm('カレンダーの予定を取り込みますか？\n（スプレッドシートに追記されます）')) return;

                                const start = document.getElementById('importStart').value;
                                const end = document.getElementById('importEnd').value;

                                try {
                                    alert('取り込みを開始します...時間がかかる場合があります。');
                                    const res = await fetch(targetUrl, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'text/plain' },
                                        body: JSON.stringify({ action: 'import', startDate: start, endDate: end })
                                    });
                                    const data = await res.json();
                                    if (data.status === 'success') {
                                        alert(`${data.count}件の予定を取り込みました！\nデータは自動的に更新されます。`);
                                        if (onImportCompleted) onImportCompleted();
                                        onClose();
                                    } else {
                                        alert(`エラーが発生しました:\n${data.message}\n\n※ GASの実行ログを確認してください。`);
                                    }
                                } catch (e) {
                                    alert('通信エラー: ' + e.toString());
                                }
                            }}
                        >
                            📅 インポート実行
                        </button>
                    </div>
                )}

                {/* Danger Zone: Reset */}
                <div style={{
                    marginTop: '30px',
                    borderTop: '2px solid #ffcdd2',
                    paddingTop: '20px'
                }}>
                    <h4 style={{ margin: '0 0 10px', color: '#c62828', fontSize: '14px' }}>
                        ⚠️ 危険な操作
                    </h4>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px', lineHeight: '1.6' }}>
                        この端末内のデータを全て削除し、Google連携を解除します。<br />
                        <span style={{ color: '#888' }}>※ スプレッドシートや他端末のデータは消えません。再連携でデータは戻ります。</span>
                    </div>
                    <button
                        onClick={() => {
                            const confirmed = window.confirm(
                                '⚠️ アプリを初期化しますか？\n\n' +
                                '・Google連携が解除されます\n' +
                                '・この端末内のデータが全て消去されます\n\n' +
                                '※ スプレッドシートや他端末のデータは消えません'
                            );
                            if (confirmed) {
                                onReset();
                                onClose();
                                alert('✅ 初期化が完了しました。');
                            }
                        }}
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '13px',
                            border: '1px solid #ef9a9a',
                            borderRadius: '8px',
                            background: '#fff5f5',
                            color: '#c62828',
                            cursor: 'pointer'
                        }}
                    >
                        🗑️ アプリの初期化（連携解除＆全削除）
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsModal;