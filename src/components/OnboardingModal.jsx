import { useState } from 'react';
import { CATEGORY_PRESETS, THEMES } from '../utils';

const STEPS = ['welcome', 'category', 'theme', 'gas', 'done'];

function OnboardingModal({ onComplete, onCategoriesChange, onThemeChange, onSaveUrl, currentTheme }) {
    const [step, setStep] = useState(0);
    const [selectedPreset, setSelectedPreset] = useState('default');
    const [gasUrl, setGasUrl] = useState('');

    const totalSteps = STEPS.length;
    const currentStep = STEPS[step];

    const next = () => setStep(s => Math.min(s + 1, totalSteps - 1));
    const prev = () => setStep(s => Math.max(s - 1, 0));

    const handleFinish = () => {
        // Apply preset if changed from default
        const preset = CATEGORY_PRESETS[selectedPreset];
        if (preset) onCategoriesChange(preset.categories);

        // Save GAS URL if entered
        if (gasUrl.trim()) {
            localStorage.setItem('gas_webapp_url', gasUrl.trim());
            onSaveUrl(gasUrl.trim());
        }

        onComplete();
    };

    const overlayStyle = {
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
    };

    const cardStyle = {
        background: 'var(--cream)',
        borderRadius: '20px',
        padding: '28px 24px 24px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
        maxHeight: '85vh',
        overflowY: 'auto',
        position: 'relative',
    };

    const dotStyle = (active) => ({
        width: active ? '20px' : '8px',
        height: '8px',
        borderRadius: '4px',
        background: active ? 'var(--forest)' : '#ccc',
        transition: 'all 0.3s',
    });

    const btnPrimary = {
        background: 'var(--forest)', color: 'white',
        border: 'none', borderRadius: '12px',
        padding: '12px 20px', fontSize: '14px',
        fontWeight: 'bold', cursor: 'pointer',
        flex: 1,
    };

    const btnSecondary = {
        background: '#f0f0f0', color: '#666',
        border: 'none', borderRadius: '12px',
        padding: '12px 20px', fontSize: '14px',
        cursor: 'pointer',
    };

    return (
        <div style={overlayStyle}>
            <div style={cardStyle}>
                {/* ステップインジケーター */}
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '24px' }}>
                    {STEPS.map((_, i) => (
                        <div key={i} style={dotStyle(i === step)} />
                    ))}
                </div>

                {/* STEP: ようこそ */}
                {currentStep === 'welcome' && (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📓</div>
                            <h2 style={{ fontSize: '22px', color: 'var(--forest)', margin: '0 0 8px', fontWeight: 'bold' }}>
                                LogNote へようこそ
                            </h2>
                            <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.7', margin: 0 }}>
                                日々の活動を手軽に記録・管理できるアプリです。
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                            {[
                                { icon: '✏️', title: '記録タブ', desc: '活動内容・場所・人数などを記録' },
                                { icon: '📋', title: '一覧タブ', desc: '過去の記録を検索・編集・削除' },
                                { icon: '📊', title: '月報タブ', desc: '月ごとの集計・報告書／Discord用コピー' },
                            ].map(item => (
                                <div key={item.title} style={{
                                    display: 'flex', gap: '12px', alignItems: 'flex-start',
                                    background: 'var(--mist)', borderRadius: '10px', padding: '10px 12px'
                                }}>
                                    <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--forest)' }}>{item.title}</div>
                                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button style={{ ...btnPrimary, width: '100%' }} onClick={next}>
                            はじめる →
                        </button>
                    </div>
                )}

                {/* STEP: カテゴリ選択 */}
                {currentStep === 'category' && (
                    <div>
                        <h3 style={{ fontSize: '18px', color: 'var(--forest)', margin: '0 0 6px' }}>🏷️ 用途を選択</h3>
                        <p style={{ fontSize: '12px', color: '#888', margin: '0 0 16px', lineHeight: '1.6' }}>
                            あなたの用途に合ったカテゴリセットを選びます。後から自由に変更できます。
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                            {Object.entries(CATEGORY_PRESETS).map(([key, preset]) => {
                                const isSelected = selectedPreset === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedPreset(key)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            padding: '12px 14px', borderRadius: '12px', textAlign: 'left',
                                            border: isSelected ? '2px solid var(--forest)' : '2px solid #e0e0e0',
                                            background: isSelected ? 'var(--mist)' : 'white',
                                            cursor: 'pointer', transition: 'all 0.15s',
                                        }}
                                    >
                                        <span style={{
                                            width: '20px', height: '20px', borderRadius: '50%',
                                            border: '2px solid',
                                            borderColor: isSelected ? 'var(--forest)' : '#ccc',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            {isSelected && <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--forest)', display: 'block' }} />}
                                        </span>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--ink)' }}>{preset.label}</div>
                                            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                                {preset.categories.map(c => `${c.icon}${c.name}`).join('  ')}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button style={btnSecondary} onClick={prev}>← 戻る</button>
                            <button style={btnPrimary} onClick={next}>次へ →</button>
                        </div>
                    </div>
                )}

                {/* STEP: テーマ選択 */}
                {currentStep === 'theme' && (
                    <div>
                        <h3 style={{ fontSize: '18px', color: 'var(--forest)', margin: '0 0 6px' }}>🎨 テーマを選択</h3>
                        <p style={{ fontSize: '12px', color: '#888', margin: '0 0 16px' }}>
                            好みの色テーマを選んでください。後からでも変更できます。
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '24px' }}>
                            {Object.entries(THEMES).map(([key, theme]) => {
                                const isActive = currentTheme === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => onThemeChange(key)}
                                        style={{
                                            padding: '10px 4px 8px', borderRadius: '12px', textAlign: 'center',
                                            border: isActive ? '2.5px solid var(--forest)' : '2px solid #e0e0e0',
                                            background: isActive ? 'var(--mist)' : '#fafafa',
                                            cursor: 'pointer', transition: 'all 0.15s',
                                            position: 'relative',
                                        }}
                                    >
                                        {isActive && (
                                            <span style={{
                                                position: 'absolute', top: '2px', right: '4px',
                                                fontSize: '9px', color: 'var(--forest)', fontWeight: 'bold'
                                            }}>✓</span>
                                        )}
                                        <div style={{ fontSize: '22px', marginBottom: '4px' }}>{theme.emoji}</div>
                                        <div style={{ fontSize: '9px', color: '#666', lineHeight: 1.2 }}>{theme.label}</div>
                                    </button>
                                );
                            })}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button style={btnSecondary} onClick={prev}>← 戻る</button>
                            <button style={btnPrimary} onClick={next}>次へ →</button>
                        </div>
                    </div>
                )}

                {/* STEP: Google連携（任意） */}
                {currentStep === 'gas' && (
                    <div>
                        <h3 style={{ fontSize: '18px', color: 'var(--forest)', margin: '0 0 6px' }}>☁️ Google連携（任意）</h3>
                        <p style={{ fontSize: '12px', color: '#888', margin: '0 0 6px', lineHeight: '1.6' }}>
                            GoogleスプレッドシートのGASと連携すると、データのバックアップや複数端末での共有ができます。
                        </p>
                        <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 14px' }}>
                            ※ スキップして後から設定することもできます。
                        </p>
                        <input
                            type="url"
                            placeholder="https://script.google.com/macros/s/..."
                            value={gasUrl}
                            onChange={(e) => setGasUrl(e.target.value)}
                            inputMode="url"
                            style={{
                                width: '100%', padding: '10px', borderRadius: '8px',
                                border: '1.5px solid #ddd', fontSize: '13px',
                                marginBottom: '8px', boxSizing: 'border-box',
                            }}
                        />
                        <a href="./help.html" target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: '12px', color: 'var(--forest)', display: 'block', marginBottom: '20px' }}>
                            👉 GASの設定手順はこちら
                        </a>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button style={btnSecondary} onClick={prev}>← 戻る</button>
                            <button style={btnPrimary} onClick={next}>
                                {gasUrl.trim() ? '保存して次へ →' : 'スキップ →'}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP: 完了 */}
                {currentStep === 'done' && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '56px', marginBottom: '14px' }}>🎉</div>
                        <h2 style={{ fontSize: '20px', color: 'var(--forest)', margin: '0 0 10px' }}>準備完了！</h2>
                        <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.7', margin: '0 0 24px' }}>
                            すべての設定が完了しました。<br />
                            「記録タブ」から活動を記録していきましょう。<br />
                            設定はいつでも右上の⚙️から変更できます。
                        </p>
                        <button style={{ ...btnPrimary, width: '100%', fontSize: '15px', padding: '14px' }} onClick={handleFinish}>
                            📓 LogNote をはじめる
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OnboardingModal;
