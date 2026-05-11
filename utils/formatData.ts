import { format, formatDistance, formatRelative, isValid, parseISO } from 'date-fns';

export function formatDate(date: Date | string, pattern = 'PPP'): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return 'Invalid date';
  return format(parsedDate, pattern);
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'PPP p');
}

export function formatRelativeTime(date: Date | string): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return 'Invalid date';
  return formatDistance(parsedDate, new Date(), { addSuffix: true });
}

export function formatRelativeDate(date: Date | string): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return 'Invalid date';
  return formatRelative(parsedDate, new Date());
}

export function formatShortDate(date: Date | string): string {
  return formatDate(date, 'MMM d, yyyy');
}

export function formatTime(date: Date | string): string {
  return formatDate(date, 'p');
}
