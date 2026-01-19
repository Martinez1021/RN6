// Date/Time Formatting Utilities

/**
 * Format a datetime string to a readable date
 * @param {string} dateString - ISO or Odoo datetime string
 * @returns {string} Formatted date (e.g., "Mon, Jan 15, 2024")
 */
export function formatDate(dateString) {
    if (!dateString) return '-';

    const date = new Date(dateString.replace(' ', 'T'));
    return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format a datetime string to a readable time
 * @param {string} dateString - ISO or Odoo datetime string
 * @returns {string} Formatted time (e.g., "09:30")
 */
export function formatTime(dateString) {
    if (!dateString) return '-';

    const date = new Date(dateString.replace(' ', 'T'));
    return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

/**
 * Format a datetime string to full date and time
 * @param {string} dateString - ISO or Odoo datetime string
 * @returns {string} Full formatted datetime
 */
export function formatDateTime(dateString) {
    if (!dateString) return '-';

    const date = new Date(dateString.replace(' ', 'T'));
    return date.toLocaleString('es-ES', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

/**
 * Format hours as HH:MM
 * @param {number} hours - Decimal hours (e.g., 8.5)
 * @returns {string} Formatted duration (e.g., "8h 30m")
 */
export function formatDuration(hours) {
    if (!hours || hours === 0) return '0h 0m';

    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    return `${h}h ${m}m`;
}

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {string} dateString - ISO or Odoo datetime string
 * @returns {string} Relative time string
 */
export function getRelativeTime(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString.replace(' ', 'T'));
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return formatDate(dateString);
}

/**
 * Calculate duration between two dates
 * @param {string} startDate - Start datetime
 * @param {string} endDate - End datetime (optional, defaults to now)
 * @returns {string} Duration string
 */
export function calculateDuration(startDate, endDate = null) {
    if (!startDate) return '-';

    const start = new Date(startDate.replace(' ', 'T'));
    const end = endDate ? new Date(endDate.replace(' ', 'T')) : new Date();

    const diffMs = end - start;
    const hours = diffMs / (1000 * 60 * 60);

    return formatDuration(hours);
}

export default {
    formatDate,
    formatTime,
    formatDateTime,
    formatDuration,
    getRelativeTime,
    calculateDuration,
};
