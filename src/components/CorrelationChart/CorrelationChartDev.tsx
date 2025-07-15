import * as echarts from 'echarts/core';
import {
    DataZoomComponent,
    GridComponent,
    MarkLineComponent,
    TitleComponent,
    TooltipComponent,
    VisualMapComponent,
} from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import type { ECBasicOption } from 'echarts/types/dist/shared';
import {
    facieToColor,
    facieToName,
    getGisData,
    getMinAndMaxDepth,
    getRandomFacie,
    splitRangeIntoRandomIntervals,
    uuid4
} from './CorrelationChart.utils.ts';
import type { TData, TFacieId, TMinMax } from './CorrelationChart.types.ts';

echarts.use([
    DataZoomComponent,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    VisualMapComponent,
    MarkLineComponent,
    LineChart,
    CanvasRenderer,
]);


const nk = getGisData(15000, 0.1, 1000, { min: 0.1, max: 150, fractionDigits: 2 });
const gk = getGisData(15_000, 0.1, 1500, { min: 0.1, max: 1000, fractionDigits: 1 });
const ps = getGisData(20000, 0.1, 700, { min: 0.1, max: 100, fractionDigits: 1 });

const { min, max } = getMinAndMaxDepth(gk, nk, ps);

const faciesIntervals = splitRangeIntoRandomIntervals(min, max, 20).map(([start]) => [start, getRandomFacie()])

const lineData = faciesIntervals.map(([start]) => [start, getRandomFacie()])

const facieSeries = {
    name: `facies`,
    type: 'line',
    data: lineData,
    dimensions: ['depth', 'facie'],
    encode: {
        y: 0,
        x: 1,
        tooltip: [0, 1]
    },
    showSymbol: false,
    lineStyle: { width: 20 },
    xAxisIndex: 4,
    yAxisIndex: 4,
    animation: false,
    connectNulls: false
}

export const CorrelationChartDev = () => {
    const chartRef = useRef(null);

    useEffect(() => {
        const chartDom = chartRef.current;
        const myChart = echarts.init(chartDom);

        const depthYAxis = {
            position: 'left',
            offset: 70,
            nameRotate: 90,
            name: 'А.О.',
            nameTextStyle: {
                fontWeight: 'bold',
                fontSize: 14,
                verticalAlign: 'bottom',
            },
            splitLine: {
                show: false
            },
            inverse: true,
            nameLocation: 'start',
            type: 'value',
            min,
            max,
            gridIndex: 0,
        };

        const zoomSyncYAxis = [0, 2, 3, 4]

        const diffBetweenFirstAndSecondYAxis = 234;

        const option: ECBasicOption = {
            dataZoom: [
                {
                    type: 'inside',
                    yAxisIndex: zoomSyncYAxis,
                    filterMode: 'none',
                    minSpan: 5,
                },
                {
                    left: 50,
                    type: 'slider',
                    show: true,
                    yAxisIndex: zoomSyncYAxis,
                    id: 'dataZoomY__slider',
                    filterMode: 'none',
                    handleLabel: { show: true },
                    dataBackground: { areaStyle: { opacity: 0 }, lineStyle: { opacity: 0 } },
                    selectedDataBackground: { areaStyle: { opacity: 0 }, lineStyle: { opacity: 0 } },
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
                    textStyle: { color: '#333' },
                },
                {
                    // fake datazoom для шкалы Y "глубина"
                    type: 'inside',
                    yAxisIndex: 1,
                    filterMode: 'none',
                    minSpan: 5,
                },
            ],
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'line', axis: 'y', snap: false, },
                snap: false,
                formatter: (params) => {
                    const depthValue = params[0]?.axisValue ?? 0;
                    const depth = `<div>А.О. ${depthValue}</div>`;

                    const facieValue = lineData.find(([start, facie], index) => {
                        if (depthValue < start) {
                            return false
                        }
                        const next = lineData[index + 1] ?? [];
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

                    const curvesContent = params.map(({ seriesName, marker, data }) => {
                        return `<div>${marker} ${seriesName} ${data[0]}</div>`
                    }).join('\n')

                    return `<div>${depth}${faciesContent}<br />${curvesContent}</div>`
                }
            },
            axisPointer: {
                snap: false,
                link: [{ yAxisIndex: [0, 2, 3] }],
            },
            grid: [
                { left: '120px', width: '200px', top: '140px', bottom: '100px' }, // Область для первого графика
                { left: '320px', width: '40px', top: '140px', bottom: '100px', tooltip: { show: false } },  // Центр между 1 и 2
                { left: '360px', width: '200px', top: '140px', bottom: '100px' },  // Область для второго графика
                { left: '570px', width: '40px', top: '140px', bottom: '100px', tooltip: { show: false } },  // Область для литологии
            ],
            xAxis: [
                {
                    name: 'ГК',
                    nameTextStyle: {
                        color: '#C01DB5',
                        fontWeight: 'bold',
                        fontSize: 14,
                        padding: 4
                    },
                    splitLine: { show: false },
                    offset: 20,
                    type: 'value',
                    nameLocation: 'center',
                    position: 'top',
                    axisLine: { onZero: false },
                    min: 0.1,
                    max: 1000,
                    gridIndex: 0,
                },
                {
                    name: 'НК',
                    nameTextStyle: {
                        color: '#1D43C0', fontWeight: 'bold',
                        fontSize: 14,
                        padding: 4
                    },
                    splitLine: { show: false },
                    type: 'value',
                    nameLocation: 'center',
                    position: 'top',
                    offset: 70,
                    axisLine: { onZero: false },
                    min: 0.1,
                    max: 150,
                    gridIndex: 0,
                },
                {
                    name: 'ПС',
                    nameTextStyle: {
                        color: '#CD0D1F', fontWeight: 'bold',
                        fontSize: 14,
                        padding: 4
                    },
                    splitLine: { show: false },
                    type: 'value',
                    nameLocation: 'center',
                    position: 'top',
                    offset: 70,
                    axisLine: { onZero: false },
                    min: 0.1,
                    max: 100,
                    gridIndex: 2,
                },
                {
                    name: 'CENTER',
                    nameTextStyle: { color: '#CD0D1F' },
                    splitLine: { show: false },
                    type: 'value',
                    nameLocation: 'center',
                    position: 'top',
                    axisLine: { onZero: false },
                    min: 0,
                    max: 1,
                    gridIndex: 1,
                    show: false,
                },
                {
                    name: 'LITOLOGIA',
                    nameTextStyle: { color: '#CD0D1F' },
                    splitLine: { show: false },
                    type: 'category',
                    nameLocation: 'center',
                    position: 'top',
                    axisLine: { onZero: false },
                    min: 20,
                    max: 20,
                    gridIndex: 3,
                    show: false,
                },
            ],
            yAxis: [
                depthYAxis,
                {
                    position: 'left',
                    offset: 20,
                    nameRotate: 90,
                    nameTextStyle: {
                        fontWeight: 'bold',
                        fontSize: 14,
                        verticalAlign: 'bottom',
                    },
                    splitLine: {
                        show: false
                    },
                    name: 'Глубина',
                    inverse: true,
                    nameLocation: 'start',
                    type: 'value',
                    min: min + diffBetweenFirstAndSecondYAxis,
                    max: max + diffBetweenFirstAndSecondYAxis,
                    gridIndex: 0,
                }, // только для отображения и синка с основной осью А.О.
                { ...depthYAxis, gridIndex: 2, show: false },
                { ...depthYAxis, gridIndex: 1, show: false },
                { ...depthYAxis, gridIndex: 3, show: false }
            ],
            visualMap: {
                type: 'piecewise',
                show: false, // скрываем visualMap (он работает, но не отображается)
                seriesIndex: 0, // применяем ТОЛЬКО к первой серии
                dimension: 'depth', // раскрашиваем по индексу точек (ось Y)
                // orient: 'horizontal',
                pieces: lineData.map(([start, facie], index, list) => {
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
                // inRange: {
                //     color: undefined // отключаем градиент (резкие переходы)
                // }
            },
            series: [
                // для каждого цвета надо сделать типа такой линии
                facieSeries,
                {
                    large: true,
                    lineStyle: { color: '#C01DB5' },
                    color: '#C01DB5',
                    showSymbol: false,
                    smooth: true,
                    name: 'ГК',
                    type: 'line',
                    data: gk.map(([x, y]) => [y, x]),
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                },
                {
                    large: true,
                    lineStyle: { color: '#1D43C0' },
                    color: '#1D43C0',
                    showSymbol: false,
                    smooth: true,
                    name: 'НК',
                    type: 'line',
                    data: nk.map(([x, y]) => [y, x]),
                    xAxisIndex: 0, // Используем первую ось X
                    yAxisIndex: 0, // Используем первую ось Y
                },
                {
                    large: true,
                    lineStyle: { color: '#CD0D1F' },
                    color: '#CD0D1F',
                    showSymbol: false,
                    smooth: true,
                    name: 'ПС',
                    type: 'line',
                    data: ps.map(([x, y]) => [y, x]),
                    xAxisIndex: 2,
                    yAxisIndex: 2,
                },
                {
                    name: 'CENTER-MARK-LINE',
                    animation: false,
                    type: 'line',
                    xAxisIndex: 3,
                    yAxisIndex: 3,
                    markLine: {
                        silent: true,
                        label: { show: false },
                        symbol: 'none',
                        lineStyle: { color: '#CCCCCC', width: 1, type: 'solid' },
                        data: [{ xAxis: 0.5 }]
                    }
                }
            ]
        };

        myChart.on('dataZoom', function (params) {
            const start = params.batch?.[0]?.start || params.start;
            const end = params.batch?.[0]?.end || params.end;
            myChart.setOption({ dataZoom: [{}, {}, { start, end }] });
        });

        myChart.setOption(option);
    }, []);

    const [data, setData] = useState<Record<string, TData>>({});

    return <div
        style={{ height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ height: '100%', width: '50%' }} ref={chartRef}></div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3>настройки скважины</h3>
            <label>Название <input/></label>
            <h4>данные</h4>
            {Object.keys(data).map((id) => {
                const { name, value, depth, color } = data[id]
                const onChange = (type: keyof Pick<TData, 'value' | 'depth'>, minMax: keyof TMinMax) => {
                    return ({ target }: ChangeEvent<HTMLInputElement>) => {
                        const current = data[id];
                        setData(prevState => ({
                            ...prevState,
                            [id]: ({
                                ...current,
                                [type]: ({
                                    min: current[type].min,
                                    max: current[type].max,
                                    [minMax]: Number(target.value),
                                })
                            })
                        }))
                    }
                }

                return <div key={id}>
                    <label>наименование
                        <input
                            value={name}
                            onChange={({ target }) => setData(prevState => ({
                                ...prevState,
                                [id]: { ...prevState[id], name: target.value }
                            }))}
                        />
                    </label>
                    <div>
                        <label>min value
                            <input type={'number'}
                                   value={value.min}
                                   min={0}
                                   onChange={onChange('value', 'min')}
                            />
                        </label>
                        <label>max value
                            <input type={'number'}
                                   value={value.max}
                                   min={0}
                                   onChange={onChange('value', 'max')}
                            />
                        </label>
                    </div>
                    <div>
                        <label>min depth
                            <input type={'number'}
                                   value={depth.min}
                                   min={0}
                                   onChange={onChange('depth', 'min')}
                            />
                        </label>
                        <label>max depth
                            <input type={'number'}
                                   value={depth.max}
                                   min={0}
                                   onChange={onChange('depth', 'max')}
                            />
                        </label>
                    </div>
                    <div>
                        <label>цвет<input value={color} onChange={({ target }) =>
                            setData(prevState => ({ ...prevState, [id]: { ...prevState[id], color: target.value } }))}/></label>
                    </div>
                </div>
            })}
            <button onClick={() => setData(prevState => {
                const newDataId = uuid4()
                const newData: TData = {
                    name: newDataId,
                    value: { min: 0, max: 0 },
                    depth: { min: 0, max: 0 },
                    color: 'red',
                }
                return {
                    ...prevState,
                    [newDataId]: newData
                }
            })}>добавить данные
            </button>
            <h4>треки</h4>
            <ul>
                <li></li>
            </ul>
            <button>добавить трек</button>
            <button>применить</button>
        </div>
    </div>
}
