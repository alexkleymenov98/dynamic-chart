import {type FC, type ReactElement, type ReactNode, type RefObject, useRef, useState} from 'react';

import * as echarts from 'echarts/core';
import type {ECElementEvent} from 'echarts';
import type { EChartsType } from 'echarts/core';
import type {EChartsOption} from "echarts";
import {
    DataZoomComponent,
    DataZoomInsideComponent,
    DataZoomSliderComponent,
    GridComponent,
    LegendComponent,
    MarkLineComponent,
    TitleComponent,
    TooltipComponent,
    VisualMapComponent,
} from 'echarts/components';
import { BarChart, LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import {generateDynamicOption, generateOptionsAxisX} from "./utils/options.ts";
import { calcInterval} from './utils/calcInterval.ts';
import './DynamicChart.css'
import {defaultChartOptions} from "./consts.ts";
import type { IDynamicChartData, IDynamicChartOptions } from "./types.ts";

echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    VisualMapComponent,
    LegendComponent,
    BarChart,
    MarkLineComponent,
    DataZoomComponent,
    LineChart,
    CanvasRenderer,
    DataZoomInsideComponent,
    DataZoomSliderComponent,
    UniversalTransition
]);

export interface IDynamicChartProps  {
    configs: IDynamicChartData[];
    externalOptions?: Partial<IDynamicChartOptions>;
    render(charts: ReactElement[]): ReactNode
    wrapperRef?: RefObject<HTMLDivElement | null>
}

export const DynamicChart: FC<IDynamicChartProps> = ({ render, configs, wrapperRef, externalOptions = {} }) => {

    const internalRef = useRef(0)

    const options = {...defaultChartOptions, ...externalOptions}

    const { chartHeight, syncZoom, syncTooltip, intervalSetting } = options

    const [chartNodes] = useState<ReactElement[]>(() => {
        const chartInstances: EChartsType[] = [];

        return configs.map((config) => {
            const { xData, yData, name } = config

            return <div className='dynamic-chart' style={{ height: `${chartHeight}px` }} ref={instance => {
                const myChart = echarts.init(instance);
                chartInstances.push(myChart)

                const dynamicOption:EChartsOption = generateDynamicOption(config, options)

                const option: EChartsOption = {
                    title: {
                        text: name,
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: { type: 'cross' }
                    },
                    xAxis: generateOptionsAxisX({data: xData, interval: calcInterval(xData.length, intervalSetting)}),
                    ...dynamicOption,
                    series: yData.map((value)=>({
                        ...value,
                        data: value.data,
                        type: value?.type ?? 'line',
                        name: value.name ?? '',
                        symbol: 'circle',
                        symbolSize: 5,
                        yAxisIndex: value.yAxisIndex ?? 0,
                    }))
                };

                myChart.setOption(option);
                myChart.on('dataZoom', function (params: any) {
                    let start = params.start;
                    let end = params.end;
                    let dataZoomId = params.dataZoomId;
                    const batch = params.batch;
                    if (batch?.[0]) {
                        start = batch[0].start;
                        end = batch[0].end;
                        dataZoomId = batch[0].dataZoomId;
                    }

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

                    if(syncZoom){
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

                    if(interval !== internalRef.current){
                        internalRef.current = interval
                        myChart.setOption(
                            {xAxis: generateOptionsAxisX({data: xData, interval})}, {replaceMerge: ['xAxis']});
                    }
                });


                myChart.on('hideTip', function () {
                    chartInstances.forEach(targetChart => {
                        if (targetChart !== myChart) {
                            targetChart.dispatchAction({ type: 'hideTip'}, { silent: true });
                            targetChart.dispatchAction({
                                type: 'updateAxisPointer',
                                x: -100, // Уводим за пределы графика
                                y: -100
                            }, { silent: true });
                        }
                    })
                })
                myChart.on('showTip', function (params: ECElementEvent['']) {
                    if(syncTooltip){
                        if (params.dataIndex !== undefined) {
                            chartInstances.forEach(targetChart => {
                                if (targetChart !== myChart) {
                                    targetChart.dispatchAction({
                                        type: 'showTip',
                                        seriesIndex: 0,
                                        dataIndex: params.dataIndex
                                    }, { silent: true });
                                }
                            })
                        }
                    }

                });

                window.addEventListener('resize', () => myChart.resize())
            }}/>;
        })
    })

    return (<div ref={wrapperRef} className="wrapper-chart">{render(chartNodes)}</div>)
}

