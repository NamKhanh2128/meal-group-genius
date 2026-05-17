import { differenceInDays, format, parseISO } from "date-fns";

export const daysUntil = (iso: string) => differenceInDays(parseISO(iso), new Date());
export const fmtDate = (iso: string) => format(parseISO(iso), "dd/MM/yyyy");
export const fmtRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
};