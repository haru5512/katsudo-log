export const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

// ── Default Categories & Presets ──────────────────────────────
export const DEFAULT_CATEGORIES = [
    { name: '訪問', icon: '🚶' },
    { name: '会議', icon: '🤝' },
    { name: 'イベント', icon: '🎪' },
    { name: '資料作成', icon: '📝' },
    { name: '事務作業', icon: '🗂️' },
    { name: 'その他', icon: '🌿' },
];

export const CATEGORY_PRESETS = {
    default: {
        label: '汎用（デフォルト）',
        categories: DEFAULT_CATEGORIES,
    },
    cooperator: {
        label: '地域おこし協力隊',
        categories: [
            { name: '訪問', icon: '🚶' },
            { name: '会議', icon: '🤝' },
            { name: 'イベント', icon: '🎪' },
            { name: '資料作成', icon: '📝' },
            { name: '事務作業', icon: '🗂️' },
            { name: 'その他', icon: '🌿' },
        ],
    },
    sales: {
        label: '営業',
        categories: [
            { name: '商談', icon: '🤝' },
            { name: '訪問', icon: '🚶' },
            { name: '移動', icon: '🚗' },
            { name: '資料作成', icon: '📝' },
            { name: '会議', icon: '💼' },
            { name: 'その他', icon: '📌' },
        ],
    },
    student: {
        label: '学生',
        categories: [
            { name: '授業', icon: '📖' },
            { name: '自習', icon: '✏️' },
            { name: 'サークル', icon: '🏃' },
            { name: 'バイト', icon: '💰' },
            { name: 'ゼミ', icon: '🎓' },
            { name: 'その他', icon: '📌' },
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
