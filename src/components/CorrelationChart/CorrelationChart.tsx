import {type ReactElement, type ReactNode, useEffect, useMemo, useRef} from "react";
import type {
    CorrelationChartData,
    CorrelationChartOptions,
    CorrelationSplitLine, TFacieId,
} from "./CorrelationChart.types.ts";
import * as echarts from 'echarts/core';
import type {EChartsOption} from "echarts";
import {
    DataZoomComponent,
    DataZoomInsideComponent, DataZoomSliderComponent, GraphicComponent,
    GridComponent,
    LegendComponent,
    TitleComponent,
    TooltipComponent
} from "echarts/components";
import {BarChart, LineChart} from "echarts/charts";
import {CanvasRenderer} from "echarts/renderers";
import './CorrelationChart.css'
import {
    CONNECT_LINE,
    DEFAULT_OPTIONS,
    TABLET_PADDING,
    TRACK_GAP,
    Y_AXIS_DEPTH_NAME, Y_AXIS_DEPTH_NAME_ABSOLUTE, Y_AXIS_SATURATION_NAME
} from "./CorrelationChart.consts.ts";
import {UniversalTransition} from "echarts/features";
import {LinkedListInstance} from "./LinkedList.ts";
import {
    facieToColor, facieToName,
} from "./CorrelationChart.utils.ts";
import {
    calcYAxisWithGrid,
    generateGrid,
    generateSeriesBetweenGrid,
    generateXAxis,
    generateYAxis,
    groupSyncYAxis
} from "./utils";
import {renderSpliteLines} from "./utils/renderSpliteLines.ts";
import {generateZoom} from "./utils/generateZoom.ts";
import type {IDataZoomParams} from "../DynamicChart/DynamicChart.types.ts";


echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    GraphicComponent,
    LegendComponent,
    BarChart,
    DataZoomComponent,
    LineChart,
    CanvasRenderer,
    DataZoomInsideComponent,
    DataZoomSliderComponent,
    UniversalTransition
]);

interface CorrelationChartProps {
    data: CorrelationChartData[]
    splitLines: Record<string, CorrelationSplitLine[]>
    memoizeOptions?: Partial<CorrelationChartOptions>

    render: (charts: ReactElement[]) => ReactNode;
}

export const CorrelationChart = ({data, render, memoizeOptions = {}, splitLines}: CorrelationChartProps) => {
    const chartRef = useRef<HTMLDivElement>(null)

    const chartInstances = useRef(new LinkedListInstance())

    const options: Required<CorrelationChartOptions> = useMemo(
        () => ({
            ...DEFAULT_OPTIONS,
            ...memoizeOptions
        })
        , [memoizeOptions])

    const chartNodes = useMemo<ReactElement[]>(() => {
        return data.map((config, index): ReactElement => {
            const {name, data, grids, saturation} = config;

            const widthWidget = TABLET_PADDING.LEFT + options.widthGrid * grids.length + TRACK_GAP * (grids.length - 1) + TABLET_PADDING.RIGHT

            const colorsValues = data.reduce<Record<string, string>>((acc, value) => ({
                ...acc,
                [value.name]: value.color
            }), {})

            const seriesLineBetween = generateSeriesBetweenGrid(config)

            const yAxis = generateYAxis(config);
            const syncAxisDepth = groupSyncYAxis(yAxis, Y_AXIS_DEPTH_NAME)
            const syncAxisDepthAbsolute = groupSyncYAxis(yAxis, Y_AXIS_DEPTH_NAME_ABSOLUTE, Y_AXIS_SATURATION_NAME)

            return (
                <>
                    {index !== 0 && (
                        <div
                            key={`prev-${name}`}
                            className="correlation-between-chart"
                            style={{height: `${options.height}px`, width: `${options.tabletGap}px`}}
                            ref={(instance) => {
                                if (!instance) {
                                    return
                                }

                                const chart = echarts.init(instance);

                                const option: EChartsOption = {
                                    id: `grid-between-${index}`,
                                    grid: [
                                        {id: 'grid-between', left: 0, right: 0, top: '10%', bottom: '10%'},
                                    ],

                                }
                                chartInstances.current.append({instance: chart, name: CONNECT_LINE})

                                chart.setOption(option)
                            }}
                        />
                    )}
                    <div
                        key={name}
                        className="correlation-chart"
                        style={{height: `${options.height}px`, width: `${widthWidget}px`}}
                        ref={(instance) => {
                            if (!instance) {
                                return
                            }

                            const chart = echarts.init(instance);

                            const option: EChartsOption = {
                                animation: false,
                                id: name,
                                title: {
                                    text: name,
                                    left: 'center'
                                },
                                dataZoom: [
                                    {
                                        id: 'depth-inside-absolute',
                                        type: 'inside',
                                        yAxisIndex: syncAxisDepthAbsolute,
                                        filterMode: 'none',
                                        minSpan: 5,
                                    },
                                    {
                                        left: 40,
                                        type: 'slider',
                                        show: true,
                                        yAxisIndex: syncAxisDepthAbsolute,
                                        id: 'dataZoomY__slider_depth_absolute',
                                        filterMode: 'none',
                                        handleLabel: {show: true},
                                        dataBackground: {areaStyle: {opacity: 0}, lineStyle: {opacity: 0}},
                                        selectedDataBackground: {areaStyle: {opacity: 0}, lineStyle: {opacity: 0}},
                                        width: 15,
                                        minSpan: 20,
                                        handleIcon: 'M10 10 A5 5 0 1 0 20 10 A5 5 0 1 0 10 10',
                                        handleSize: '80%',
                                        handleStyle: {
                                            color: '#fff',
                                            shadowBlur: 3,
                                            shadowColor: 'rgba(0, 0, 0, 0.6)',
                                            shadowOffsetX: 1,
                                            shadowOffsetY: 2,
                                        },
                                        fillerColor: 'rgba(67, 128, 255, 0.2)',
                                        borderColor: '#ddd',
                                        backgroundColor: '#f5f5f5',
                                        textStyle: {color: '#333'},
                                    },
                                    {
                                        id: 'depth-inside',
                                        type: 'inside',
                                        yAxisIndex: syncAxisDepth,
                                        filterMode: 'none',
                                        minSpan: 5,
                                    },
                                    ...generateZoom(config, options, colorsValues)
                                ],
                                grid: generateGrid(config, options),
                                xAxis: generateXAxis(config, colorsValues),
                                yAxis: generateYAxis(config),
                                tooltip: {
                                    trigger: 'axis',
                                    axisPointer: {type: 'line', axis: 'y', snap: false,},
                                    formatter: (params) => {
                                        const depthValue = params[0]?.axisValue ?? 0;
                                        const depth = `<div>А.О. ${depthValue}</div>`;

                                        const facieValue = saturation.find(([start, facie], index) => {
                                            if (depthValue < start) {
                                                return false
                                            }
                                            const next = saturation[index + 1] ?? [];
                                            const nextStart = next[0] ?? Infinity;
                                            return depthValue <= nextStart;
                                        })

                                        let faciesContent = '';

                                        if (facieValue) {
                                            const facieId = facieValue[1] as TFacieId;
                                            if (facieId !== -9999) {
                                                const facieName = facieToName[facieId];
                                                const marker = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${facieToColor[facieId]};"></span>`
                                                faciesContent = `<div>${marker} ${facieName}</div>`
                                            }
                                        }

                                        const curvesContent = params.filter(({seriesName}) => seriesName !== 'facies').map(({
                                                                                                                                seriesName,
                                                                                                                                marker,
                                                                                                                                data
                                                                                                                            }) => {
                                            return `<div>${marker} ${seriesName} ${data[0]}</div>`
                                        }).join('\n')

                                        return `<div>${depth}${faciesContent}<br />${curvesContent}</div>`
                                    }
                                },
                                axisPointer: {
                                    snap: false,
                                    lineStyle: {
                                        width: 0 // полностью отключаем линию
                                    },
                                    link: [{yAxisIndex: syncAxisDepthAbsolute}],
                                },
                                visualMap: {
                                    type: 'piecewise',
                                    show: false, // скрываем visualMap (он работает, но не отображается)
                                    seriesIndex: seriesLineBetween.length + data.length - 1, // применяем ТОЛЬКО к первой серии
                                    dimension: 'depth', // раскрашиваем по индексу точек (ось Y)
                                    pieces: saturation.map(([start, facie], index, list) => {
                                        const next = list[index + 1];
                                        let lte = undefined;
                                        if (next) {
                                            lte = next[0];
                                        }

                                        return {
                                            gte: start,
                                            lte,
                                            color: facieToColor[facie as TFacieId],
                                        }
                                    }),
                                },
                                series: [...data.map(({data, name, color, xAxisIndex, yAxisIndex, gridIndex}) => ({
                                    large: true,
                                    lineStyle: {color},
                                    color,
                                    showSymbol: false,
                                    smooth: true,
                                    type: 'line',
                                    name,
                                    data: data.map(([x, y]) => [y, x]),
                                    xAxisIndex,
                                    yAxisIndex: calcYAxisWithGrid(yAxisIndex, gridIndex),
                                })),
                                    ...seriesLineBetween] as EChartsOption['series'],
                            };

                            chartInstances.current.append({instance: chart, name: name})

                            chart.on('dataZoom', function (_params: unknown) {
                                const params = _params as IDataZoomParams;
                                const start = params.start;
                                const end = params.end;
                                chart.setOption({dataZoom: [{}, {}, {start, end}]});

                                if (!['depth-inside-absolute', 'dataZoomY__slider_depth_absolute'].includes(params.dataZoomId)) {
                                    return
                                }

                                const currentId = chart.id
                                chartInstances.current.forEach((instance) => {
                                    if (instance.id !== currentId) {
                                        instance.dispatchAction({
                                            type: 'dataZoom',
                                            start,
                                            end,
                                            dataZoomIndex: 0,
                                        }, {silent: true});
                                    }
                                })

                                renderSpliteLines(chartInstances, splitLines, options)
                            });

                            chart.setOption(option);
                        }}
                    />
                </>
            );
        });
    }, [data, options])

    useEffect(() => {
            renderSpliteLines(chartInstances, splitLines, options)
        }
        ,
        [splitLines]
    )
    ;

    return (<div ref={chartRef}>{render(chartNodes)}</div>)
}