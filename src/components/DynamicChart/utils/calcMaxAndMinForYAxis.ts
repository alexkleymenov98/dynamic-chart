import type { IDynamicChartData, IMinAndMaxValueYAxis } from '../DynamicChart.types.ts';
import { DEFAULT_MIN_MAX } from '../DynamicChart.const.ts';

export function calcMaxAndMinForYAxis(data: IDynamicChartData): IMinAndMaxValueYAxis {
  const xDateLength = data.xData.length ?? 0;

  if (!xDateLength) {
    return DEFAULT_MIN_MAX;
  }

  let minValue: number | null = null;
  let maxValue: number | null = null;

  const yData = data.yData;

  yData.forEach((lines) => {
    lines.data.forEach((value) => {
      if (!maxValue || value > maxValue) {
        maxValue = value;
      }

      if (!minValue || value < minValue) {
        minValue = value;
      }
    });
  });

  const delta = Number(maxValue) - Number(minValue);

  return {
    minValueY: Number(minValue) - delta,
    maxValueY: Number(maxValue) + delta,
  };
}
