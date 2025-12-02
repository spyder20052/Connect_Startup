// Simple date formatting utilities to replace date-fns

export function formatDistanceToNow(date, options = {}) {
    const now = Date.now();
    const timestamp = typeof date === 'number' ? date : new Date(date).getTime();
    const seconds = Math.floor((now - timestamp) / 1000);

    if (seconds < 60) return options.addSuffix ? 'il y a quelques secondes' : 'quelques secondes';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        const text = minutes === 1 ? '1 minute' : `${minutes} minutes`;
        return options.addSuffix ? `il y a ${text}` : text;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        const text = hours === 1 ? '1 heure' : `${hours} heures`;
        return options.addSuffix ? `il y a ${text}` : text;
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
        const text = days === 1 ? '1 jour' : `${days} jours`;
        return options.addSuffix ? `il y a ${text}` : text;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        const text = months === 1 ? '1 mois' : `${months} mois`;
        return options.addSuffix ? `il y a ${text}` : text;
    }

    const years = Math.floor(months / 12);
    const text = years === 1 ? '1 an' : `${years} ans`;
    return options.addSuffix ? `il y a ${text}` : text;
}

export function formatDate(date, format = 'dd/MM/yyyy') {
    const d = typeof date === 'number' ? new Date(date) : new Date(date);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return format
        .replace('dd', day)
        .replace('MM', month)
        .replace('yyyy', year)
        .replace('HH', hours)
        .replace('mm', minutes);
}

// French locale object for compatibility
export const fr = { code: 'fr' };
