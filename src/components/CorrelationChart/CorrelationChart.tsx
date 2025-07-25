import {type ReactElement, type ReactNode, useEffect, useMemo, useRef} from "react";
import type {
    CorrelationChartData,
    CorrelationChartOptions, CorrelationChartWithInnerOptions,
    CorrelationSplitLine, IDataZoomParams, TFacieId,
} from "./CorrelationChart.types.ts";
import * as echarts from 'echarts/core';
import type {EChartsOption} from "echarts";
import {
    DataZoomComponent,
    DataZoomInsideComponent, DataZoomSliderComponent, GraphicComponent,
    GridComponent,
    LegendComponent,
    TitleComponent,
    VisualMapComponent,
    TooltipComponent, MarkLineComponent
} from "echarts/components";
import {BarChart, LineChart} from "echarts/charts";
import {CanvasRenderer} from "echarts/renderers";
import './CorrelationChart.css'
import {
    AXIS_X_HEIGHT,
    CONNECT_LINE,
    DEFAULT_OPTIONS,
    TABLET_PADDING,
    TRACK_GAP,
    Y_AXIS_DEPTH_NAME, Y_AXIS_DEPTH_NAME_ABSOLUTE, Y_AXIS_SATURATION_NAME
} from "./CorrelationChart.consts.ts";
import {UniversalTransition} from "echarts/features";
import {LinkedListInstance} from "./LinkedList.ts";
import {
    facieToColor,
} from "./CorrelationChart.utils.ts";
import {
    calcYAxisWithGrid,
    generateGrid,
    generateSeriesBetweenGrid,
    generateXAxis,
    generateYAxis,
    groupSyncYAxis,
    generateSplitLine,
    renderSplitLines,
    generateTooltip,
    generateZoom,
} from "./utils";


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
    UniversalTransition,
    VisualMapComponent,
    MarkLineComponent,
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

    const splitLineLimit = useRef<Map<string, CorrelationSplitLine[]>>(new Map())

    const gridPaddingTop = useMemo(() => {
        let maxCountAxisX = 0;

        for (const chartData of data) {
            const countOnGrids = chartData.data.reduce<Record<number, number>>((acc, currentValue) => {
                if (currentValue.gridIndex in acc) {
                    acc[currentValue.gridIndex] = acc[currentValue.gridIndex] + 1;
                } else {
                    acc[currentValue.gridIndex] = 1;
                }

                return acc
            }, {});

            for (const count of Object.values(countOnGrids)) {
                if (maxCountAxisX < count) {
                    maxCountAxisX = count
                }
            }
        }

        return 20 + AXIS_X_HEIGHT * maxCountAxisX
    }, [data])

    const options: Required<CorrelationChartWithInnerOptions> = useMemo(
        () => ({
            ...DEFAULT_OPTIONS,
            ...memoizeOptions,
            gridPaddingTop,
        })
        , [gridPaddingTop, memoizeOptions])

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
                                tooltip: generateTooltip(config, colorsValues),
                                axisPointer: {
                                    snap: false,
                                    lineStyle: {
                                        width: 0 // полностью отключаем линию
                                    },
                                    link: [{yAxisIndex: syncAxisDepthAbsolute}],
                                },
                                visualMap: [
                                    {
                                        type: 'piecewise',
                                        show: false, // скрываем visualMap (он работает, но не отображается)
                                        dimension: 0, // Используем ось Y (значения depth) для раскраски
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
                                    }
                                ],
                                series: [...data.map(({data, name, color, xAxisIndex, yAxisIndex, gridIndex}) => ({
                                    large: true,
                                    id: name,
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

                            splitLineLimit.current = generateSplitLine(splitLines, name, splitLineLimit.current)

                            chart.on('dataZoom', function (_params: unknown) {
                                const params = _params as IDataZoomParams;
                                const start = params.batch?.[0].start ?? params.start;
                                const end = params.batch?.[0].end ?? params.end;
                                chart.setOption({dataZoom: [{}, {}, {start, end}]});

                                if (params.dataZoomId && params.dataZoomId.includes('dataZoomX__slider')) {
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

                                renderSplitLines(chartInstances, options, splitLineLimit)
                            });

                            chart.setOption(option);
                        }}
                    />
                </>
            );
        });
    }, [data, options, splitLines, splitLineLimit])

    useEffect(() => {
            renderSplitLines(chartInstances, options, splitLineLimit)
        }
        ,
        [options, splitLines]
    )
    ;

    return (<div ref={chartRef}>{render(chartNodes)}</div>)
}