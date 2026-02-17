import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

function SettingsModal({ isOpen, onClose, onSaveUrl, onImportCompleted, onReset, gasUrl: propGasUrl }) {
    const [url, setUrl] = useState('');
    const [showQr, setShowQr] = useState(false);

    useEffect(() => {
        // Sync with prop or localStorage
        const saved = localStorage.getItem('gas_webapp_url');
        setUrl(saved || propGasUrl || '');
    }, [isOpen, propGasUrl]);

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

    return (
        <div className="modal-overlay" style={{
            display: 'flex', position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center'
        }} onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
            <div style={{
                background: 'white', width: '90%', maxWidth: '400px', borderRadius: '16px',
                padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <h3 style={{ fontFamily: "'Shippori Mincho',serif", fontSize: '18px', color: 'var(--forest)', marginBottom: '16px' }}>
                    ⚙️ 設定 (Google連携)
                </h3>

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
                    <button className="btn-secondary" onClick={onClose} style={{ flex: 1, margin: 0 }}>キャンセル</button>
                    <button className="btn-primary" onClick={handleSave} style={{ flex: 1 }}>保存</button>
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