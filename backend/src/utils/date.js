const getMonthRange = (monthString) => {
  const [yearRaw, monthRaw] = String(monthString || '').split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);

  if (!year || !month || month < 1 || month > 12) {
    throw new Error('Invalid month format. Use YYYY-MM');
  }

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return { start, end, year, month };
};

const normalizeDate = (inputDate) => {
  const parsed = new Date(inputDate);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid date');
  }

  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
};

const getDaysInMonth = (year, month) => {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
};

const getTodayRange = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return { start, end };
};

/**
 * Returns week buckets for the given month.
 * Each bucket is { label: 'Week 1', startDay: 1, endDay: 7 } (day numbers, 1-indexed).
 */
const getWeekRanges = (year, month) => {
  const totalDays = getDaysInMonth(year, month);
  const weeks = [];
  let weekNum = 1;
  let day = 1;

  while (day <= totalDays) {
    const startDay = day;
    const endDay = Math.min(day + 6, totalDays);
    weeks.push({
      label: `Week ${weekNum}`,
      startDay,
      endDay,
    });
    day = endDay + 1;
    weekNum += 1;
  }

  return weeks;
};

module.exports = {
  getMonthRange,
  normalizeDate,
  getDaysInMonth,
  getTodayRange,
  getWeekRanges,
};
