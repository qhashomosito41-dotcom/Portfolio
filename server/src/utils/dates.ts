export const formatDateOnly = (date: Date | null | undefined): string | null => {
  if (!date) return null;
  return date.toISOString().slice(0, 10);
};

export const parseDateOnly = (value: string): Date => {
  const date = new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }
  return date;
};
