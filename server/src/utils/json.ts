export const parseStringList = (value: string | null | undefined): string[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

export const stringifyStringList = (value: string[] | null | undefined): string =>
  JSON.stringify(Array.isArray(value) ? value.map((item) => item.trim()).filter(Boolean) : []);
