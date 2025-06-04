import type { TInternalSetting } from '../DynamicChart.types';

export function calcInterval(xAxisDiffInMonth: number, setting: TInternalSetting) {
  const countMonthForYear = 12;
  const months = Object.keys(setting)
    .map(year => Number(year) * countMonthForYear)
    .sort((a, b) => a < b ? 1 : -1);

  let interval = 0

  months.forEach((countMonths) => {
    if (xAxisDiffInMonth >= countMonths) {
      const year = countMonths / countMonthForYear;

      interval = setting[year];
    }
  });

  return interval;
}
