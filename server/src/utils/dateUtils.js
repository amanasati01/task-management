import { TASK_STATUSES } from './constants.js';

export const normalizeToUtcMidnight = (dateInput) => {
  if (!dateInput) return null;
  if (typeof dateInput === 'string') {
    const datePart = dateInput.split('T')[0];
    const parts = datePart.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    }
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
};

export const getTodayKolkataUtcMidnight = () => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const kolkataDateStr = formatter.format(new Date());
  return normalizeToUtcMidnight(kolkataDateStr);
};

export const isTaskOverdue = (dueDate, status) => {
  if (!dueDate) return false;
  if (status === TASK_STATUSES.COMPLETED || status === TASK_STATUSES.CANCELLED) {
    return false;
  }
  const today = getTodayKolkataUtcMidnight();
  const normalizedDue = normalizeToUtcMidnight(dueDate);
  return today.getTime() > normalizedDue.getTime();
};

export const formatDateOnly = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};
