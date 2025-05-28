import * as React from 'react';
import { type ReactElement, type ReactNode, useRef, useState } from 'react';

import type { EChartsType } from 'echarts/core';
import { init, use as echartsUse } from 'echarts/core';
import type { ECElementEvent, EChartsOption } from 'echarts';
import {
    DataZoomComponent,
    DataZoomInsideComponent,
    DataZoomSliderComponent,
    GridComponent,
    LegendComponent,
    TitleComponent,
    TooltipComponent,
} from 'echarts/components';
import { BarChart, LineChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { generateDynamicOption, generateOptionsAxisX } from './utils/options.ts';
import { calcInterval } from './utils/calcInterval.ts';
import './DynamicChart.css'
import { DEFAULT_CHART_OPTIONS } from './consts.ts';
import type { IDataZoomParams, IDynamicChartData, IDynamicChartOptions } from './types.ts';
import type { GridOption } from 'echarts/types/dist/shared';

echartsUse([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    BarChart,
    DataZoomComponent,
    LineChart,
    CanvasRenderer,
    DataZoomInsideComponent,
    DataZoomSliderComponent,
]);

export interface IDynamicChartProps {
    data: IDynamicChartData[];
    options?: Partial<IDynamicChartOptions>;

    render(charts: ReactElement[]): ReactNode
}

export const DynamicChart = React.forwardRef<HTMLDivElement, IDynamicChartProps>(
    ({ render, data, options: _options = {} }, ref) => {
        const intervalRef = useRef(0)

        const [chartNodes] = useState<ReactElement[]>(() => {
            const options = { ...DEFAULT_CHART_OPTIONS, ..._options }
            const { chartHeight, syncZoom, syncTooltip, intervalSetting } = options
            const chartInstances: EChartsType[] = [];

            return data.map((config) => {
                const { xData, yData, name } = config

                return <div className="dynamic-chart" style={{ height: `${chartHeight}px` }} ref={instance => {
                    const myChart = init(instance);
                    chartInstances.push(myChart)

                    const dynamicOption = generateDynamicOption(config, options)
                    const xAxisLength = dynamicOption.grid.length;

                    const option: EChartsOption = {
                        title: {
                            text: name,
                        },
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: { type: 'cross' }
                        },
                        xAxis: generateOptionsAxisX({
                            xAxisLength,
                            data: xData,
                            interval: calcInterval(xData.length, intervalSetting)
                        }),
                        ...dynamicOption,
                        series: yData.map((value) => ({
                            ...value,
                            data: value.data,
                            type: value?.type ?? 'line',
                            name: value.name ?? '',
                            symbol: 'circle',
                            large: true,
                            symbolSize: 5,
                            yAxisIndex: value.yAxisIndex ?? 0,
                            xAxisIndex: value.yAxisIndex ?? 0,
                        }))
                    };
                    const defaultGridTopOffset = Number(dynamicOption.grid[0].top ?? 0);
                    const defaultGridBottomOffset = Number(dynamicOption.grid[0].bottom ?? 0);
                    myChart.setOption(option);

                    myChart.on('dataZoom', function (_params: unknown) {
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

                        if (dataZoomId.startsWith('dataZoomY__slider-')) {
                            const options = (myChart.getOption() as typeof option)
                            const grid = options.grid as GridOption[];
                            const gridIndex = Number(dataZoomId.slice(-1));
                            const bottom = start;
                            const top = 100 - end;

                            const gridHeight = chartHeight - defaultGridTopOffset - defaultGridBottomOffset;
                            const onePercentInPixels = gridHeight / 100;

                            grid[gridIndex].top = top * onePercentInPixels + defaultGridTopOffset;
                            grid[gridIndex].bottom = bottom * onePercentInPixels + defaultGridBottomOffset;
                            myChart.setOption({ grid })
                            return;
                        }

                        // todo: по возможности убрать приватный метод getModel
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        const model = myChart.getModel();
                        const xAxis = model.getComponent('xAxis', 0).axis;

                        if (!xAxis) return;

                        const startValue = xAxis.scale.getExtent()[0];
                        const endValue = xAxis.scale.getExtent()[1];

                        const diff = endValue - startValue;

                        const interval = calcInterval(diff, intervalSetting)

                        if (!['dataZoomX__inside', 'dataZoomX__slider'].includes(dataZoomId)) {
                            return
                        }

                        if (syncZoom) {
                            chartInstances.forEach(targetChart => {
                                if (targetChart !== myChart) { // чтобы не обновлять сам источник события
                                    targetChart.dispatchAction({
                                        type: 'dataZoom',
                                        start,
                                        end,
                                        dataZoomIndex: 0,
                                    }, { silent: true });
                                }
                            });
                        }

                        if (interval !== intervalRef.current) {
                            intervalRef.current = interval
                            myChart.setOption(
                                {
                                    xAxis: generateOptionsAxisX({
                                        xAxisLength,
                                        data: xData,
                                        interval
                                    })
                                }, { replaceMerge: ['xAxis'] });
                        }
                    });


                    myChart.on('hideTip', function () {
                        chartInstances.forEach(targetChart => {
                            if (targetChart !== myChart) {
                                targetChart.dispatchAction({ type: 'hideTip' }, { silent: true });
                                targetChart.dispatchAction({
                                    type: 'updateAxisPointer',
                                    x: -100, // Уводим за пределы графика
                                    y: -100
                                }, { silent: true });
                            }
                        })
                    })
                    myChart.on('showTip', function (params: ECElementEvent['']) {
                        if (!syncTooltip || params.dataIndex === undefined) {
                            return
                        }
                        chartInstances.forEach(targetChart => {
                            const options = (targetChart.getOption() as typeof option)
                            const grid = options.grid as GridOption[];

                            grid.forEach((_value, index) => targetChart.dispatchAction({
                                    type: 'showTip',
                                    seriesIndex: index,
                                    dataIndex: params.dataIndex
                                }, { silent: true })
                            )
                        })
                    });

                    window.addEventListener('resize', () => myChart.resize())
                }}/>;
            })
        })

        return (<div ref={ref} className="wrapper-chart">{render(chartNodes)}</div>)
    })
