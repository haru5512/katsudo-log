import { useState, useMemo } from 'react';
import { formatDate, buildCategoryIcons } from '../utils';

function MonthlyTab({ records, categories }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [toastMsg, setToastMsg] = useState('');
    const [previewMode, setPreviewMode] = useState('report'); // 'report' or 'discord'
    const [showOutputOptions, setShowOutputOptions] = useState(false);
    const [outputOptions, setOutputOptions] = useState(() => {
        try {
            const saved = localStorage.getItem('output_options');
            return saved ? JSON.parse(saved) : { place: true, note: true, count: true };
        } catch { return { place: true, note: true, count: true }; }
    });
    const [showDiscordOptions, setShowDiscordOptions] = useState(false);
    const [discordOptions, setDiscordOptions] = useState(() => {
        try {
            const saved = localStorage.getItem('discord_output_options');
            return saved ? JSON.parse(saved) : { note: true };
        } catch { return { note: true }; }
    });

    const categoryIcons = buildCategoryIcons(categories);

    const toggleOption = (key) => {
        const updated = { ...outputOptions, [key]: !outputOptions[key] };
        setOutputOptions(updated);
        localStorage.setItem('output_options', JSON.stringify(updated));
    };

    const toggleDiscordOption = (key) => {
        const updated = { ...discordOptions, [key]: !discordOptions[key] };
        setDiscordOptions(updated);
        localStorage.setItem('discord_output_options', JSON.stringify(updated));
    };

    const changeMonth = (dir) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + dir);
        setCurrentMonth(newDate);
    };

    const { monthRecs, stats, exportText, discordText } = useMemo(() => {
        const y = currentMonth.getFullYear();
        const m = currentMonth.getMonth() + 1;

        const allMonthRecs = records.filter(r => {
            const d = new Date(r.date);
            return d.getFullYear() === y && d.getMonth() + 1 === m;
        }).sort((a, b) => a.date > b.date ? 1 : -1);

        const reportRecs = allMonthRecs.filter(r => !r.excludeFromReport);

        const days = new Set(reportRecs.map(r => r.date)).size;
        const people = reportRecs.reduce((sum, r) => sum + (r.count || 0), 0);

        // countStat: true のカテゴリごとに件数を集計
        const statCategories = categories
            ? categories.filter(c => c.countStat)
            : [];
        const categoryCounts = statCategories.map(cat => ({
            name: cat.name,
            icon: cat.icon,
            count: reportRecs.filter(r => r.category === cat.name).length,
        }));

        const daysInMonth = new Date(y, m, 0).getDate();
        const exportLines = [];
        const discordLines = [`**【${y}年${m}月 活動報告】**\n`];

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const { m: mm, day: dd, wd: w } = formatDate(dateStr);
            const dateHeader = `${mm}/${dd}(${w})`;
            const dayRecs = reportRecs.filter(r => r.date === dateStr);

            // 報告書フォーマット（outputOptionsで制御）
            let content = '';
            if (dayRecs.length > 0) {
                content = dayRecs.map(r => {
                    let line = r.content;
                    if (outputOptions.place && r.place) line += `（${r.place}）`;
                    const extras = [];
                    if (outputOptions.count && r.count) extras.push(`👥${r.count}名`);
                    if (outputOptions.note && r.note) extras.push(`※${r.note}`);
                    if (extras.length > 0) line += ` ${extras.join(' ')}`;
                    return line;
                }).join('、');
            }
            exportLines.push(content);

            // Discordフォーマット（discordOptionsで制御）
            discordLines.push(`**${dateHeader}**`);
            if (dayRecs.length > 0) {
                dayRecs.forEach(r => {
                    let line = `> ・${r.content}`;
                    if (discordOptions.note && r.note) line += ` ※${r.note}`;
                    discordLines.push(line);
                });
            }
            discordLines.push('');
        }

        const text = exportLines.join('\n');
        const discord = discordLines.join('\n');

        return { monthRecs: allMonthRecs, stats: { days, people, categoryCounts }, exportText: text, discordText: discord };
    }, [records, currentMonth, outputOptions, discordOptions, categories]);


    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text).then(() => {
            setToastMsg(`📋 ${label}をコピーしました`);
            setTimeout(() => setToastMsg(''), 2000);
        }).catch(() => {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setToastMsg(`📋 ${label}をコピーしました`);
            setTimeout(() => setToastMsg(''), 2000);
        });
    };

    const handleCopy = () => {
        const text = previewMode === 'report' ? exportText : discordText;
        const label = previewMode === 'report' ? '日報用テキスト' : 'Discord用テキスト';
        copyToClipboard(text, label);
    };

    return (
        <div className="page active">
            <div className="card">
                <div className="month-header">
                    <div className="month-nav">
                        <button className="month-nav-btn" onClick={() => changeMonth(-1)}>‹</button>
                        <div className="month-label">
                            {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
                        </div>
                        <button className="month-nav-btn" onClick={() => changeMonth(1)}>›</button>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-num">{stats.days}</div>
                        <div className="stat-label">活動日数</div>
                    </div>
                    {stats.categoryCounts && stats.categoryCounts.map(cat => (
                        <div className="stat-card" key={cat.name}>
                            <div className="stat-num">{cat.icon} {cat.count}</div>
                            <div className="stat-label">{cat.name}</div>
                        </div>
                    ))}
                    <div className="stat-card">
                        <div className="stat-num">{stats.people}</div>
                        <div className="stat-label">延べ参加者</div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-title">月間活動ログ</div>
                {monthRecs.length === 0 ? (
                    <div className="empty-state" style={{ padding: '20px' }}>
                        <div className="empty-text" style={{ color: '#ccc', textAlign: 'center' }}>この月の記録はありません</div>
                    </div>
                ) : (
                    (() => {
                        // Group by date
                        const grouped = {};
                        monthRecs.forEach(r => {
                            if (!grouped[r.date]) grouped[r.date] = [];
                            grouped[r.date].push(r);
                        });

                        return Object.entries(grouped).map(([date, groupRecs]) => {
                            const { day, wd } = formatDate(date);
                            return (
                                <div key={date} className="monthly-group" style={{ marginBottom: '16px' }}>
                                    <div className="monthly-group-header" style={{
                                        fontWeight: 'bold',
                                        color: 'var(--forest)',
                                        background: '#f4f7f6',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        marginBottom: '6px',
                                        fontSize: '14px'
                                    }}>
                                        {day}日（{wd}）
                                    </div>
                                    <div className="monthly-group-items" style={{ paddingLeft: '8px' }}>
                                        {groupRecs.map(r => (
                                            <div key={r.id} className="monthly-log-item" style={{
                                                display: 'flex',
                                                padding: '6px 0',
                                                borderBottom: '1px solid #eee',
                                                fontSize: '14px',
                                                alignItems: 'baseline'
                                            }}>
                                                <div style={{ width: '45px', fontSize: '11px', color: '#888', flexShrink: 0 }}>
                                                    {r.time || '--:--'}
                                                </div>
                                                <div className="monthly-content" style={{ flex: 1 }}>
                                                    <span style={{ marginRight: '6px' }}>{categoryIcons[r.category] || '📌'}</span>
                                                    <span style={{
                                                        fontWeight: '500',
                                                        marginRight: '8px',
                                                        textDecoration: r.excludeFromReport ? 'line-through' : 'none',
                                                        color: r.excludeFromReport ? '#aaa' : 'inherit'
                                                    }}>
                                                        {r.content}
                                                    </span>
                                                    <span style={{ fontSize: '12px', color: '#666' }}>
                                                        {[
                                                            r.place && `📍${r.place}`,
                                                            r.count && `👥${r.count}名`
                                                        ].filter(Boolean).join(' ')}
                                                    </span>
                                                    {r.note && <div style={{ fontSize: '11px', color: '#888', marginTop: '2px', paddingLeft: '22px' }}>Note: {r.note}</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        });
                    })()
                )}
            </div>


            <div className="card">
                <div className="card-title">
                    <span>出力</span>
                    <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center' }}>
                        {/* 表示項目ボタン（報告書モード） */}
                        {previewMode === 'report' && (() => {
                            const checkedCount = Object.values(outputOptions).filter(Boolean).length;
                            const totalCount = Object.keys(outputOptions).length;
                            const allChecked = checkedCount === totalCount;
                            return (
                                <button
                                    onClick={() => setShowOutputOptions(v => !v)}
                                    style={{
                                        padding: '4px 8px', fontSize: '11px', borderRadius: '4px',
                                        border: `1px solid ${showOutputOptions ? 'var(--forest)' : '#aaa'}`,
                                        background: showOutputOptions ? 'var(--mist)' : 'white',
                                        color: showOutputOptions ? 'var(--forest)' : '#555',
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '5px'
                                    }}
                                >
                                    ⚙️ 表示項目
                                    <span style={{
                                        display: 'inline-block',
                                        minWidth: '18px',
                                        padding: '0 4px',
                                        borderRadius: '10px',
                                        background: allChecked ? 'var(--forest)' : '#f0a500',
                                        color: 'white',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        lineHeight: '18px',
                                    }}>
                                        {checkedCount}/{totalCount}
                                    </span>
                                </button>
                            );
                        })()}
                        {/* 表示項目ボタン（Discordモード） */}
                        {previewMode === 'discord' && (() => {
                            const checkedCount = Object.values(discordOptions).filter(Boolean).length;
                            const totalCount = Object.keys(discordOptions).length;
                            const allChecked = checkedCount === totalCount;
                            return (
                                <button
                                    onClick={() => setShowDiscordOptions(v => !v)}
                                    style={{
                                        padding: '4px 8px', fontSize: '11px', borderRadius: '4px',
                                        border: `1px solid ${showDiscordOptions ? '#5865F2' : '#aaa'}`,
                                        background: showDiscordOptions ? '#eef0ff' : 'white',
                                        color: showDiscordOptions ? '#5865F2' : '#555',
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '5px'
                                    }}
                                >
                                    ⚙️ 表示項目
                                    <span style={{
                                        display: 'inline-block',
                                        minWidth: '18px',
                                        padding: '0 4px',
                                        borderRadius: '10px',
                                        background: allChecked ? '#5865F2' : '#f0a500',
                                        color: 'white',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        lineHeight: '18px',
                                    }}>
                                        {checkedCount}/{totalCount}
                                    </span>
                                </button>
                            );
                        })()}
                        <button
                            onClick={() => setPreviewMode('report')}
                            style={{
                                padding: '4px 8px', fontSize: '11px', borderRadius: '4px',
                                border: '1px solid var(--forest)',
                                background: previewMode === 'report' ? 'var(--forest)' : 'white',
                                color: previewMode === 'report' ? 'white' : 'var(--forest)', cursor: 'pointer'
                            }}
                        >報告書</button>
                        <button
                            onClick={() => setPreviewMode('discord')}
                            style={{
                                padding: '4px 8px', fontSize: '11px', borderRadius: '4px',
                                border: '1px solid #5865F2',
                                background: previewMode === 'discord' ? '#5865F2' : 'white',
                                color: previewMode === 'discord' ? 'white' : '#5865F2', cursor: 'pointer'
                            }}
                        >Discord</button>
                    </div>
                </div>

                {/* 表示項目パネル（報告書モード） */}
                {showOutputOptions && previewMode === 'report' && (
                    <div style={{
                        display: 'flex', gap: '8px', flexWrap: 'wrap',
                        padding: '10px 12px', background: '#f8f8f8',
                        borderRadius: '8px', marginBottom: '10px', fontSize: '13px'
                    }}>
                        {[
                            { key: 'place', label: '📍 場所' },
                            { key: 'count', label: '👥 人数' },
                            { key: 'note', label: '📝 メモ' },
                        ].map(({ key, label }) => {
                            const isOn = outputOptions[key];
                            return (
                                <button
                                    key={key}
                                    onClick={() => toggleOption(key)}
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        border: isOn ? '1.5px solid var(--forest)' : '1.5px solid #ccc',
                                        background: isOn ? 'var(--forest)' : '#f0f0f0',
                                        color: isOn ? 'white' : '#888',
                                        fontWeight: isOn ? 'bold' : 'normal',
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        transition: 'all 0.15s',
                                        userSelect: 'none',
                                    }}
                                >
                                    {isOn ? '✓' : '　'}{label}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* 表示項目パネル（Discordモード） */}
                {showDiscordOptions && previewMode === 'discord' && (
                    <div style={{
                        display: 'flex', gap: '8px', flexWrap: 'wrap',
                        padding: '10px 12px', background: '#f0f1ff',
                        borderRadius: '8px', marginBottom: '10px', fontSize: '13px'
                    }}>
                        {[
                            { key: 'note', label: '📝 メモ' },
                        ].map(({ key, label }) => {
                            const isOn = discordOptions[key];
                            return (
                                <button
                                    key={key}
                                    onClick={() => toggleDiscordOption(key)}
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        border: isOn ? '1.5px solid #5865F2' : '1.5px solid #ccc',
                                        background: isOn ? '#5865F2' : '#f0f0f0',
                                        color: isOn ? 'white' : '#888',
                                        fontWeight: isOn ? 'bold' : 'normal',
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        transition: 'all 0.15s',
                                        userSelect: 'none',
                                    }}
                                >
                                    {isOn ? '✓' : '　'}{label}
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="export-area" style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '12px' }}>
                    {previewMode === 'report' ? exportText : discordText}
                </div>
                <button className="btn-secondary" onClick={handleCopy} style={{ marginTop: '10px', borderColor: previewMode === 'discord' ? '#5865F2' : '', color: previewMode === 'discord' ? '#5865F2' : '' }}>
                    📋 {previewMode === 'report' ? '報告書用コピー' : 'Discord形式でコピー'}
                </button>
                {previewMode === 'report' && (
                    <div style={{ marginTop: '8px', padding: '8px 12px', background: '#fff3cd', borderRadius: '8px', fontSize: '11px', color: '#856404', lineHeight: '1.5' }}>
                        💡 <strong>報告書への貼り付け方：</strong>スプレッドシートの<strong>活動内容列の最初のセル</strong>（例：C9）を選択して貼り付けてください。
                    </div>
                )}
            </div>

            <div className={`toast ${toastMsg ? 'show' : ''}`} style={{ transform: toastMsg ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(80px)' }}>
                {toastMsg}
            </div>
        </div>
    );
}

export default MonthlyTab;
