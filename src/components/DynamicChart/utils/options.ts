import type { EChartsOption } from 'echarts';
import type { IDynamicChartData, IDynamicChartOptions, TAxisYLength } from '../types.ts';
import { DEFAULT_Y_AXIS, DEFAULT_Y_ZOOM, POSITION_Y_LABEL, POSITION_Y_SCALE, STEP_VALUE } from '../consts.ts';
import type { GridOption, XAXisOption } from 'echarts/types/dist/shared';


export const generateDynamicOption = (params: IDynamicChartData, options: IDynamicChartOptions): Omit<EChartsOption, 'grid'> & {
    grid: GridOption[]
} => {
    const grids = generateGrid(params, options);
    return {
        grid: grids,
        yAxis: generateYAxis(params),
        dataZoom: generateDataZoom(params, grids.length, options),
        legend: {
            textStyle: {
                color: '#333',          // Цвет текста
                fontSize: 12,
                fontWeight: 'bold'
            },
            itemStyle: {
                borderWidth: 1,         // Граница иконок
                borderColor: '#ccc'
            },
            itemWidth: 25,              // Ширина иконки
            itemHeight: 14,             // Высота иконки
            left: Array.isArray(params?.yAxis) && params?.yAxis?.length > 3 ? STEP_VALUE * 2 : STEP_VALUE,
            bottom: 0,
            type: 'scroll',             // Активирует прокрутку
            pageButtonItemGap: 5,       // Расстояние между кнопками
            pageIconColor: '#2f4554',
            pageIconInactiveColor: '#aaa',
            pageTextStyle: {
                color: '#333'
            }
        }
    }
}

const generateYAxis = (params: IDynamicChartData): EChartsOption['yAxis'] => {
    const { yAxis } = params

    if (yAxis) {
        const yAxisArray: EChartsOption['yAxis'] = []

        if (!Array.isArray(yAxis)) {
            yAxisArray.push(yAxis)
        } else {

            for (let i = 0; i < yAxis.length; i++) {
                const currentYAxis = yAxis[i]

                const isPositionRight = i === 1 || i === 2

                const offset = getOffsetPositionLabelYOnIndex(i, yAxis.length as TAxisYLength)

                if (typeof currentYAxis === 'object') {
                    yAxisArray.push({
                        ...DEFAULT_Y_AXIS,
                        position: isPositionRight ? 'right' : 'left',
                        offset,
                        ...yAxis[i],
                        gridIndex: i,
                    })
                }
            }
        }

        return yAxisArray.concat(yAxisArray.map((yAxis) => {
            return {
                ...yAxis,
                id: `${yAxis.id}__${yAxis.id}`,
                gridIndex: yAxisArray.length,
            }
        }))
    }

    return [{ ...DEFAULT_Y_AXIS, position: 'left' }]
}

const generateGrid = (params: IDynamicChartData, options: IDynamicChartOptions): GridOption[] => {
    const step = STEP_VALUE
    const top = 60;

    let bottom = 100

    const { showSliderX } = options

    if (showSliderX) {
        bottom = 140
    }

    const { yAxis = [] } = params

    let result: GridOption = {
        left: step * 2,
        right: step * 2,
        bottom,
        top
    };

    if (!yAxis || !Array.isArray(yAxis) || yAxis.length === 1) {
        result = {
            left: step,
            right: 0,
            bottom,
            top,
        }
    } else if (yAxis.length === 2) {
        result = {
            left: step,
            right: step,
            bottom,
            top,
        }
    } else if (yAxis.length === 3) {
        result = {
            left: step,
            right: step * 2,
            bottom,
            top,
        }
    }


    return yAxis.map(() => result).concat(result) // на каждую шкалу Y нужен отдельный grid без лейблов, и в конце 1 грид с всеми лейблами
}

const generateDataZoom = (params: IDynamicChartData, gridsLength: number, options?: IDynamicChartOptions): EChartsOption['dataZoom'] => {

    const result: EChartsOption['dataZoom'] = [
        {
            id: 'dataZoomX__inside',
            type: 'inside',
            xAxisIndex: Array.from({ length: gridsLength }, (_v, k) => k),
            filterMode: 'none',
            minSpan: 3,
        },
    ]

    if (options?.showSliderX) {
        result.push({
            id: 'dataZoomX__slider',
            type: 'slider',
            xAxisIndex: Array.from({ length: gridsLength }, (_v, k) => k),
            filterMode: 'none',
            bottom: 30,
        },)
    }

    const { yAxis } = params

    if (!yAxis) {
        result.push({ ...DEFAULT_Y_ZOOM, yAxisIndex: [0], left: 0 })
    }

    if (yAxis && Array.isArray(yAxis)) {
        for (let i = 0; i < yAxis.length; i++) {
            result.push({
                ...DEFAULT_Y_ZOOM,
                id: `dataZoomY__slider-${i}`,
                yAxisIndex: gridsLength - 1 + i,
                ...getPositionOnIndex(i, yAxis.length as TAxisYLength)
            })
        }
    }

    return result
}

export const getPositionOnIndex = (index: number, len: TAxisYLength): Record<'right', number> | Record<'left', number> => {
    const valueArray = POSITION_Y_SCALE.get(len) ?? [0, 0, 0, 0]


    const values: [number, number] = valueArray[index] as [number, number] ?? [0, 0]

    const value = values[1]

    if (index === 0 || index === 3) {
        return { left: value }
    }

    return { right: value }
}

const getOffsetPositionLabelYOnIndex = (index: number, len: TAxisYLength) => {
    const valuesFromMap = POSITION_Y_LABEL.get(len) ?? [0, 0, 0, 0]

    const values: [number, number] = valuesFromMap[index] as [number, number] ?? [0, 0]

    return values[1]
}

interface IGenerateOptionsAxisXProps {
    data?: string[]
    interval?: number
    xAxisLength: number
}

export const generateOptionsAxisX = ({ data, interval, xAxisLength }: IGenerateOptionsAxisXProps): XAXisOption[] => {
    const result: XAXisOption = {
        type: 'category',
        data,
        axisLine: { onZero: false },
        axisLabel: {
            rotate: 90,
            interval: interval,
        },
        axisTick: {
            alignWithLabel: true
        }
    }
    return Array.from({ length: xAxisLength }).map((_value, index) => {
        return { ...result, show: (index + 1) === xAxisLength, gridIndex: index }
    })
}
