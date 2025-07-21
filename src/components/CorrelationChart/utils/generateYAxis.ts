import type {EChartsOption} from "echarts";
import type {CorrelationChartData} from "../CorrelationChart.types.ts";
import {Y_AXIS_DEPTH_NAME, Y_AXIS_DEPTH_NAME_ABSOLUTE, Y_AXIS_SATURATION_NAME} from "../CorrelationChart.consts.ts";

const DEFAULT_Y_AXIS: EChartsOption['yAxis'] = {
    position: 'left',
    name: Y_AXIS_DEPTH_NAME_ABSOLUTE,
    nameRotate: 90,
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
    gridIndex: 0,
    nameGap: 30,
    axisLabel:{
        padding: [20, 0, 10, 0]
    },
};

export const generateYAxis = (data: CorrelationChartData): EChartsOption['yAxis'] => {
    const result: EChartsOption['yAxis'] = []

    const {grids} = data

    const limit = grids.length + grids.length - 1

    for (let i = 0; i < limit; i++) {
        result.push({
            id: `${i >= grids.length ? `a-o-line-${i}`: `ao-${i}`}`,
            ...DEFAULT_Y_AXIS,
            gridIndex: i,
            show: i === 0,
        })

        result.push({
            id: `${i >= grids.length ? `depth-line-${i}`: `depth-${i}`}`,
            ...DEFAULT_Y_AXIS,
            gridIndex: i,
            offset:60,
            name: Y_AXIS_DEPTH_NAME,
            show: i === 0,
        })
    }

    //Добавление шкал для насыщения
    result.push({
        id: `saturation`,
        ...DEFAULT_Y_AXIS,
        gridIndex: limit,
        show: true,
        offset: -30,
        name: Y_AXIS_SATURATION_NAME,
        axisLabel: {
            show: false // Скрыть деления шкалы (ticks)
        },
        axisTick: {
            show: false // Скрыть маленькие отметки на оси
        },
        axisLine: {
            show: false // Показать саму ось (линию)
        }
    })

    return result
}