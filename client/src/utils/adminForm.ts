export const linesToArray = (value: string | undefined | null): string[] =>
  (value ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

export const arrayToLines = (value: string[] | undefined | null): string =>
  (value ?? []).join('\n');

export const commaToArray = (value: string | undefined | null): string[] =>
  (value ?? '')
    .split(/,|\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

export const arrayToCommas = (value: string[] | undefined | null): string =>
  (value ?? []).join(', ');

export const formError = (errors: Record<string, unknown>, field: string): string | undefined => {
  const value = errors[field] as { message?: string } | undefined;
  return value?.message;
};
