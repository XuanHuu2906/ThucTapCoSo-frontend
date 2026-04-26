const VI_LOCALE = "vi-VN";
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

type DateValue = string | Date | null | undefined;

const parseDate = (value: DateValue) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const dateParts = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dateParts) {
    const [, day, month, year] = dateParts;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (
  dateString?: string | null,
  fallback = "Chưa cập nhật"
) => {
  if (!dateString) return fallback;

  const date = parseDate(dateString);
  if (!date) return dateString;

  return date.toLocaleDateString(VI_LOCALE);
};

export const getDaysLeft = (value: DateValue) => {
  const dueDate = parseDate(value);
  if (!dueDate) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return Math.ceil((dueDate.getTime() - today.getTime()) / MILLISECONDS_PER_DAY);
};
