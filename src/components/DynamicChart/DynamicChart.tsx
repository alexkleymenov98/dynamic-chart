import type {EChartsOption} from 'echarts';
import type {EChartsType} from 'echarts/core';

import {type ReactElement, type ReactNode} from 'react';
import type {
    IDynamicChartData,
    IDynamicChartOptions,
    IDynamicChartWithInnerOptions,
} from './DynamicChart.types.ts';
import {BarChart, LineChart} from 'echarts/charts';
import {
    DataZoomComponent,
    DataZoomInsideComponent,
    DataZoomSliderComponent,
    GridComponent,
    LegendComponent,
    TitleComponent,
    TooltipComponent,
} from 'echarts/components';
import {use as echartsUse, init} from 'echarts/core';
import {CanvasRenderer} from 'echarts/renderers';
import {useEffect, useMemo, useRef} from 'react';
import * as React from 'react';
import {onUseChartEvent} from './utils/onChangeEvent.ts';
import {DEFAULT_CHART_OPTIONS} from './DynamicChart.const';
import {calcInterval} from './utils/calcInterval.ts';
import {getYAxisMaxCount} from './utils/getYAxisMaxCount';
import {generateDynamicOption, generateOptionsAxisX} from './utils/options.ts';
import './DynamicChart.css';

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

const DEFAULT_OPTIONS_FOR_PROPS: Partial<IDynamicChartOptions> = {};

export interface IDynamicChartProps {
    data: IDynamicChartData[];
    memoizeOptions?: Partial<IDynamicChartOptions>;

    render: (charts: ReactElement[]) => ReactNode;
}

export function DynamicChart({ref, render, data, memoizeOptions = DEFAULT_OPTIONS_FOR_PROPS}: IDynamicChartProps & {
    ref?: React.RefObject<HTMLDivElement | null>;
}) {
    const intervalRef = useRef(0);

    const chartInstances = useRef<EChartsType[]>([]);

    const chartNodes = useMemo<ReactElement[]>(() => {
        const yAxisMaxLength = getYAxisMaxCount(data);

        const options: Required<IDynamicChartWithInnerOptions> = {
            ...DEFAULT_CHART_OPTIONS,
            ...memoizeOptions,
            yAxisMaxLength,
        };
        const {chartHeight, intervalSetting} = options;

        return data.map((config): ReactElement => {
            const {xData, yData, name} = config;

            return (
                <div
                    key={name}
                    className="dynamic-chart"
                    style={{height: `${chartHeight}px`}}
                    ref={(instance) => {
                        if (!instance) {
                            return
                        }

                        const myChart = init(instance);
                        chartInstances.current.push(myChart);

                        const dynamicOption = generateDynamicOption(config, options);

                        const option: EChartsOption = {
                            title: {
                                text: name,
                            },
                            tooltip: {
                                trigger: 'axis',
                                axisPointer: {type: 'cross'},
                            },
                            xAxis: generateOptionsAxisX({
                                data: xData,
                                interval: calcInterval(xData.length, intervalSetting),
                            }),
                            ...dynamicOption,
                            series: yData.map(value => ({
                                ...value,
                                data: value.data,
                                type: value?.type ?? 'line',
                                name: value.name ?? '',
                                symbol: 'circle',
                                symbolSize: 5,
                                yAxisIndex: value.yAxisIndex ?? 0,
                            })),
                        };

                        myChart.setOption(option);

                        onUseChartEvent(myChart, options, config, chartInstances, intervalRef);
                    }}
                />
            );
        });
    }, [data, memoizeOptions]);


    useEffect(() => {
        chartInstances.current.splice(0, chartInstances.current.length - data.length)

        const listeners = chartInstances.current.map(chart => () => chart.resize());
        listeners.forEach((listener) => {
            window.addEventListener('resize', listener);
        });

        return () => {
            listeners.forEach((listener) => {
                window.removeEventListener('resize', listener);
            });
        };
    }, [chartInstances.current.length, data]);

    return (<div ref={ref} className="wrapper-chart">{render(chartNodes)}</div>);
}
