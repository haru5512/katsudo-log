export const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

// ── Color Themes ──────────────────────────────────────────────
export const THEMES = {
    forest: {
        label: 'フォレスト',
        emoji: '🌲',
        vars: {
            '--forest': '#2d5a3d',
            '--moss': '#4a7c59',
            '--leaf': '#7ab893',
            '--sky': '#a8c5da',
            '--earth': '#8b6f47',
            '--sand': '#f5f0e8',
            '--cream': '#faf8f4',
            '--ink': '#1a2e1f',
            '--mist': 'rgba(45, 90, 61, 0.08)',
            '--shadow': 'rgba(45, 90, 61, 0.15)',
        },
    },
    ocean: {
        label: 'オーシャン',
        emoji: '🌊',
        vars: {
            '--forest': '#1a4a72',
            '--moss': '#2e6da4',
            '--leaf': '#5ba3d9',
            '--sky': '#a8d4f5',
            '--earth': '#5a6e82',
            '--sand': '#e8f2fb',
            '--cream': '#f4f9fe',
            '--ink': '#0d2137',
            '--mist': 'rgba(26, 74, 114, 0.08)',
            '--shadow': 'rgba(26, 74, 114, 0.15)',
        },
    },
    sakura: {
        label: 'サクラ',
        emoji: '🌸',
        vars: {
            '--forest': '#8b3a6d',
            '--moss': '#b05990',
            '--leaf': '#d48ab5',
            '--sky': '#f0c4df',
            '--earth': '#7a5070',
            '--sand': '#fdf0f7',
            '--cream': '#fff5fb',
            '--ink': '#3a1530',
            '--mist': 'rgba(139, 58, 109, 0.08)',
            '--shadow': 'rgba(139, 58, 109, 0.15)',
        },
    },
    sunset: {
        label: 'サンセット',
        emoji: '🌄',
        vars: {
            '--forest': '#c25a1a',
            '--moss': '#e07a3a',
            '--leaf': '#f0a870',
            '--sky': '#f5d0a0',
            '--earth': '#8b5a2b',
            '--sand': '#fdf4eb',
            '--cream': '#fff9f3',
            '--ink': '#3a1a05',
            '--mist': 'rgba(194, 90, 26, 0.08)',
            '--shadow': 'rgba(194, 90, 26, 0.15)',
        },
    },
    night: {
        label: 'ナイト',
        emoji: '🌙',
        vars: {
            '--forest': '#7c9cbf',
            '--moss': '#5a7fa8',
            '--leaf': '#8ab4d4',
            '--sky': '#4a6a8a',
            '--earth': '#6a7a8a',
            '--sand': '#1e2a38',
            '--cream': '#141e2a',
            '--ink': '#d4e4f4',
            '--mist': 'rgba(124, 156, 191, 0.12)',
            '--shadow': 'rgba(0, 0, 0, 0.4)',
        },
    },
};

export function applyTheme(themeKey) {
    const theme = THEMES[themeKey] || THEMES.forest;
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, val]) => {
        root.style.setProperty(key, val);
    });
    document.documentElement.setAttribute('data-theme', themeKey);
}

export function saveTheme(themeKey) {
    localStorage.setItem('app_theme', themeKey);
}

export function loadTheme() {
    return localStorage.getItem('app_theme') || 'forest';
}


// ── Default Categories & Presets ──────────────────────────────
export const DEFAULT_CATEGORIES = [
    { name: '訪問', icon: '🚶', countStat: false },
    { name: '会議', icon: '🤝', countStat: false },
    { name: 'イベント', icon: '🎪', countStat: true },
    { name: '資料作成', icon: '📝', countStat: false },
    { name: '事務作業', icon: '🗂️', countStat: false },
    { name: 'その他', icon: '🌿', countStat: false },
];

export const CATEGORY_PRESETS = {
    default: {
        label: '汎用（デフォルト）',
        categories: DEFAULT_CATEGORIES,
    },
    cooperator: {
        label: '地域おこし協力隊',
        categories: [
            { name: '訪問', icon: '🚶', countStat: true },
            { name: '会議', icon: '🤝', countStat: false },
            { name: 'イベント', icon: '🎪', countStat: true },
            { name: '資料作成', icon: '📝', countStat: false },
            { name: '事務作業', icon: '🗂️', countStat: false },
            { name: 'その他', icon: '🌿', countStat: false },
        ],
    },
    sales: {
        label: '営業',
        categories: [
            { name: '商談', icon: '🤝', countStat: true },
            { name: '訪問', icon: '🚶', countStat: true },
            { name: '移動', icon: '🚗', countStat: false },
            { name: '資料作成', icon: '📝', countStat: false },
            { name: '会議', icon: '💼', countStat: false },
            { name: 'その他', icon: '📌', countStat: false },
        ],
    },
    student: {
        label: '学生',
        categories: [
            { name: '授業', icon: '📖', countStat: true },
            { name: '自習', icon: '✏️', countStat: false },
            { name: 'サークル', icon: '🏃', countStat: true },
            { name: 'バイト', icon: '💰', countStat: false },
            { name: 'ゼミ', icon: '🎓', countStat: false },
            { name: 'その他', icon: '📌', countStat: false },
        ],
    },
};

export function buildCategoryIcons(categories) {
    const icons = {};
    categories.forEach(cat => { icons[cat.name] = cat.icon; });
    return icons;
}

export function loadCategories() {
    const saved = localStorage.getItem('custom_categories');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) { }
    }
    return DEFAULT_CATEGORIES;
}

export function saveCategories(categories) {
    localStorage.setItem('custom_categories', JSON.stringify(categories));
}

export function toDateStr(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function toTimeStr(d) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatDate(dateStr) {
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const wd = WEEKDAYS[d.getDay()];
    return { y, m, day, wd };
}

export function generateCalendarUrl(record) {
    const { date, time, content, place, note, category } = record;
    if (!date) return '';

    let startDateTime = date.replace(/-/g, '');
    if (time) {
        startDateTime += 'T' + time.replace(':', '') + '00';
    }

    let endDateTime = '';
    function fmtDate(d) {
        return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    }
    function fmtTime(d) {
        return `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`;
    }

    if (time) {
        const d = new Date(`${date}T${time}`);
        d.setHours(d.getHours() + 1);
        endDateTime = fmtDate(d) + 'T' + fmtTime(d);
    } else {
        const d = new Date(date);
        d.setDate(d.getDate() + 1);
        endDateTime = fmtDate(d);
    }

    const details = `${note || ''}\n\n[カテゴリー] ${category}`;
    const location = place || '';

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `【${category}】${content}`,
        dates: `${startDateTime}/${endDateTime}`,
        details: details,
        location: location,
    });

    return `https://www.google.com/calendar/render?${params.toString()}`;
}
