import {type ReactElement, type ReactNode, useEffect, useMemo, useRef} from "react";
import type {
    CorrelationChartData,
    CorrelationChartOptions,
    CorrelationSplitLine,
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
import {CONNECT_LINE, DEFAULT_OPTIONS} from "./CorrelationChart.consts.ts";
import {UniversalTransition} from "echarts/features";
import {LinkedListInstance} from "./LinkedList.ts";
import {
    convertLinesToElements,
    generateConnectLineElements,
} from "./CorrelationChart.utils.ts";


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
            const {name} = config;

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
                        style={{height: `${options.height}px`, width: `${options.width}px`}}
                        ref={(instance) => {
                            if (!instance) {
                                return
                            }

                            const chart = echarts.init(instance);


                            const option: EChartsOption = {
                                animation: false,
                                title: {
                                    text: name,
                                    left: 'center'
                                },
                                grid: [
                                    {id: 'grid', left: 0, right: 0, top: '10%', bottom: '10%'}, // Область для первого графика
                                ],
                                xAxis: {
                                    type: 'category',
                                    data: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                                    axisLine: {
                                        lineStyle: {
                                            color: '#333'
                                        }
                                    }
                                },
                                yAxis: {
                                    type: 'value',
                                    axisLine: {
                                        lineStyle: {
                                            color: '#333'
                                        }
                                    },
                                    splitLine: {
                                        lineStyle: {
                                            color: '#eee'
                                        }
                                    }
                                },
                                series: [{
                                    type: 'line',
                                    data: [120, 200, 150, 80, 70, 110, 130],
                                    smooth: true,
                                    symbol: 'circle', // Маркеры в виде кружков
                                    symbolSize: 10,
                                    lineStyle: {
                                        color: '#5470C6',
                                        width: 3
                                    }
                                }],
                            };

                            chartInstances.current.append({instance: chart, name: name})

                            chart.setOption(option);

                        }}
                    />
                </>
            );
        });
    }, [data, memoizeOptions])

    useEffect(() => {
            let currentNode = chartInstances.current.head;
            while (currentNode) {
                const instance = currentNode.value.instance
                const next = currentNode.next;
                const prev = currentNode.prev;

                let elements = []

                if (currentNode.value.name === CONNECT_LINE) {
                    elements = generateConnectLineElements(currentNode, splitLines, options)
                } else {
                    elements = convertLinesToElements(splitLines?.[currentNode.value.name], instance.getWidth())
                }

                let newPositionY = 0


                // Перетаскиваем разбивки
                instance.setOption({
                    graphic: echarts.util.map(elements, function (dataItem, dataIndex) {
                        return {
                            ...dataItem,
                            ondrag: echarts.util.curry(function (dataIndex, event) {
                                newPositionY = event.offsetY - elements[dataIndex].shape.y2

                                elements[dataIndex].position = [0, newPositionY]
                                elements[dataIndex - 1].top =  event.offsetY - 20

                                instance.setOption({graphic: {elements}})

                                // Обновляем линию соединения разбивки
                                const nextInstance = next?.value.instance
                                const prevInstance = prev?.value.instance


                                if(nextInstance){
                                    const nextElements = nextInstance.getOption().graphic[0].elements ?? []
                                    const nextIndex = Math.floor(dataIndex / 2)
                                    nextElements[nextIndex].shape.y1 = event.offsetY

                                    nextInstance.setOption({graphic: {elements: nextElements}})
                                }

                                if(prevInstance){
                                    const prevElements = prevInstance.getOption().graphic[0].elements ?? []
                                    const prevIndex = Math.floor(dataIndex / 2)
                                    prevElements[prevIndex].shape.y2 = event.offsetY

                                    prevInstance.setOption({graphic: {elements: prevElements}})
                                }

                            }, dataIndex)
                        }
                    })
                })

                currentNode = currentNode.next;
            }
        }
        ,
        [splitLines]
    )
    ;

    return (<div ref={chartRef}>{render(chartNodes)}</div>)
}