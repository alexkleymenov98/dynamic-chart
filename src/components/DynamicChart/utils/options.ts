import type {DataZoomComponentOption, EChartsOption} from 'echarts';
import type {IDynamicChartData, IDynamicChartWithInnerOptions, IMinAndMaxValueYAxis, TAxisYLength} from '../types.ts';
import {
    DEFAULT_MIN_MAX,
    DEFAULT_Y_AXIS,
    DEFAULT_Y_ZOOM,
    POSITION_Y_LABEL,
    POSITION_Y_SCALE,
    STEP_VALUE
} from '../consts.ts';
import {calcMaxAndMinForYAxis} from "./calcMaxAndMinForYAxis.ts";


export const generateDynamicOption = (params: IDynamicChartData, options: IDynamicChartWithInnerOptions): EChartsOption => {
    const minAndMaxValueY = calcMaxAndMinForYAxis(params)

    return {
        grid: generateGrid(options),
        yAxis: generateYAxis(params, options, minAndMaxValueY),
        dataZoom: generateDataZoom(params, options, minAndMaxValueY),
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
            left: options.yAxisMaxLength > 3 ? STEP_VALUE * 2 : STEP_VALUE,
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

const generateYAxis = (params: IDynamicChartData, options: IDynamicChartWithInnerOptions, yMinAndMax: IMinAndMaxValueYAxis): EChartsOption['yAxis'] => {
    const {yAxis} = params

    if (yAxis) {
        const yAxisArray: EChartsOption['yAxis'] = []

        if (!Array.isArray(yAxis)) {
            yAxisArray.push(yAxis)
        } else {

            for (let i = 0; i < yAxis.length; i++) {
                const currentYAxis = yAxis[i]

                const isPositionRight = i === 1 || i === 2

                const offset = getOffsetPositionLabelYOnIndex(i, options.yAxisMaxLength as TAxisYLength)

                if (typeof currentYAxis === 'object') {
                    yAxisArray.push({
                        ...DEFAULT_Y_AXIS,
                        position: isPositionRight ? 'right' : 'left',
                        offset,
                        ...yAxis[i],
                        min: yMinAndMax.minValueY,
                        max: yMinAndMax.maxValueY,
                    })
                }
            }
        }

        return yAxisArray
    }

    return [{...DEFAULT_Y_AXIS, position: 'left'}]
}

const generateGrid = (options: IDynamicChartWithInnerOptions): EChartsOption['grid'] => {
    const step = STEP_VALUE

    let bottom = 100

    const {showSliderX} = options

    if (showSliderX) {
        bottom = 140
    }

    const length = options.yAxisMaxLength

    if (length === 1) {
        return {
            left: step,
            right: 0,
            bottom,
        }
    }

    if (length === 2) {
        return {
            left: step,
            right: step,
            bottom,
        }
    }

    if (length === 3) {
        return {
            left: step,
            right: step * 2,
            bottom,
        }
    }


    return {
        left: step * 2,
        right: step * 2,
        bottom,
    }
}

const generateDataZoom = (params: IDynamicChartData, options: IDynamicChartWithInnerOptions, yMinAndMax: IMinAndMaxValueYAxis): EChartsOption['dataZoom'] => {
    const PERCENT_START = 32;
    const PERCENT_END =  68

    const positionZoomForScale: Partial<Pick<DataZoomComponentOption, 'start' | 'end'>> = {}

    if (yMinAndMax.maxValueY !== DEFAULT_MIN_MAX.maxValueY || yMinAndMax.minValueY !== DEFAULT_MIN_MAX.minValueY) {
        positionZoomForScale.start = PERCENT_START;
        positionZoomForScale.end = PERCENT_END;
    }

    const result: EChartsOption['dataZoom'] = [
        {
            id: 'dataZoomX__inside',
            type: 'inside',
            xAxisIndex: [0],
            filterMode: 'none',
            minSpan: 3,
        },
    ]

    if (options?.showSliderX) {
        result.push({
            id: 'dataZoomX__slider',
            type: 'slider',
            xAxisIndex: [0],
            filterMode: 'none',
            bottom: 30,
        },)
    }

    const {yAxis} = params

    if (!yAxis) {
        result.push({...DEFAULT_Y_ZOOM, ...positionZoomForScale, yAxisIndex: [0], left: 0})
    }

    if (yAxis && Array.isArray(yAxis)) {
        for (let i = 0; i < yAxis.length; i++) {
            result.push({
                ...DEFAULT_Y_ZOOM,
                ...positionZoomForScale,
                id: `dataZoomY__slider-${i}`,
                yAxisIndex: [i], ...getPositionOnIndex(i, options.yAxisMaxLength as TAxisYLength)
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
        return {left: value}
    }

    return {right: value}
}

const getOffsetPositionLabelYOnIndex = (index: number, len: TAxisYLength) => {
    const valuesFromMap = POSITION_Y_LABEL.get(len) ?? [0, 0, 0, 0]

    const values: [number, number] = valuesFromMap[index] as [number, number] ?? [0, 0]

    return values[1]
}

interface IGenerateOptionsAxisXProps {
    data?: string[]
    interval?: number
}

export const generateOptionsAxisX = ({data, interval}: IGenerateOptionsAxisXProps): EChartsOption['xAxis'] => ({
    type: 'category',
    data,
    axisLine: {onZero: false},
    axisLabel: {
        rotate: 90,
        interval: interval,
    },
    axisTick: {
        alignWithLabel: true
    }
})

