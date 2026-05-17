export const isFutureDate = (iso: string) =>
  new Date(iso).getTime() >= new Date().setHours(0, 0, 0, 0);
export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
export const minLen = (s: string, n: number) => s.trim().length >= n;