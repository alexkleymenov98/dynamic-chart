import type { IDynamicChartData } from '../DynamicChart.types';

export function getYAxisMaxCount(values: IDynamicChartData[]): number {
  let max = 1;

  values.forEach((chart) => {
    if (max < Number(chart?.yAxis?.length)) {
      max = Number(chart?.yAxis?.length);
    }
  });

  return max;
}
