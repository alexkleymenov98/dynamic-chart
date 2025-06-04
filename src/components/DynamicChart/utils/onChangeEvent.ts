import type { ECElementEvent } from 'echarts';
import type { EChartsType } from 'echarts/core';
import type { RefObject } from 'react';
import type {
  IDataZoomParams,
  IDynamicChartData,
  IDynamicChartWithInnerOptions,
} from '../DynamicChart.types.ts';
import { calcInterval } from '../utils/calcInterval.ts';
import { generateOptionsAxisX } from '../utils/options.ts';

export function onUseChartEvent(chart: EChartsType, options: IDynamicChartWithInnerOptions, data: IDynamicChartData, chartInstances: RefObject<EChartsType[]>, intervalRef: RefObject<number>) {
  const { intervalSetting, syncZoom, syncTooltip } = options;
  const { xData } = data;


  chart.on('dataZoom', (_params: unknown) => {
    const params = _params as IDataZoomParams;

    let start = params.start;
    let end = params.end;
    let dataZoomId = params.dataZoomId;
    const batch = params.batch;
    if (batch?.[0]) {
      start = batch[0].start;
      end = batch[0].end;
      dataZoomId = batch[0].dataZoomId;
    }

    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    const model = chart.getModel();
    const xAxis = model.getComponent('xAxis', 0).axis;

    if (!xAxis)
      return;

    const startValue = xAxis.scale.getExtent()[0];
    const endValue = xAxis.scale.getExtent()[1];

    const diff = endValue - startValue;

    const interval = calcInterval(diff, intervalSetting);

    if (!['dataZoomX__inside', 'dataZoomX__slider'].includes(dataZoomId)) {
      return;
    }

    if (syncZoom) {
      chartInstances.current.forEach((targetChart) => {
        if (targetChart !== chart) { // чтобы не обновлять сам источник события
          targetChart.dispatchAction({
            type: 'dataZoom',
            start,
            end,
            dataZoomIndex: 0,
          }, { silent: true });
          targetChart.setOption(
            {
              xAxis: generateOptionsAxisX({
                data: xData,
                interval,
              }),
            },
            { replaceMerge: ['xAxis'] },
          );
        }
      });
    }

    if (interval !== intervalRef.current) {
      intervalRef.current = interval;
      chart.setOption(
        {
          xAxis: generateOptionsAxisX({
            data: xData,
            interval,
          }),
        },
        { replaceMerge: ['xAxis'] },
      );
    }
  });

  chart.on('hideTip', () => {
    chartInstances.current.forEach((targetChart) => {
      if (targetChart !== chart) {
        targetChart.dispatchAction({ type: 'hideTip' }, { silent: true });
        targetChart.dispatchAction({
          type: 'updateAxisPointer',
          x: -100, // Уводим за пределы графика
          y: -100,
        }, { silent: true });
      }
    });
  });
  chart.on('showTip', (params: ECElementEvent['']) => {
    if (syncTooltip) {
      if (params.dataIndex !== undefined) {
        chartInstances.current.forEach((targetChart) => {
          if (targetChart !== chart) {
            targetChart.dispatchAction({
              type: 'showTip',
              seriesIndex: 0,
              dataIndex: params.dataIndex,
            }, { silent: true });
          }
        });
      }
    }
  });
}
