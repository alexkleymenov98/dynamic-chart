import type {EChartsOption} from "echarts";
import type {CorrelationChartData} from "../CorrelationChart.types.ts";
import {AXIS_X_HEIGHT} from "../CorrelationChart.consts.ts";

const DEFAULT_X_AXIS: EChartsOption['xAxis'] = {
    splitLine: {show: false},
    type: 'value',
    nameLocation: 'middle',
    position: 'top',
    axisTick: {
        show: false // Скрыть маленькие отметки на оси
    },
    min: 'dataMin',
    max: 'dataMax'
}

export function generateXAxis(data: CorrelationChartData, colors: Record<string, string>): EChartsOption['xAxis'] {
    const result: EChartsOption['xAxis'] = []

    const {xAxis, grids} = data

    const accumulation = new Map()

    for (const axis of xAxis) {

        if (accumulation.has(axis.gridIndex)) {
            accumulation.set(axis.gridIndex, accumulation.get(axis.gridIndex) + 1)
        } else {
            accumulation.set(axis.gridIndex, 0)
        }

        result.push({
            id: `${axis.name}-${axis.gridIndex}`,
            name: axis.name,
            ...DEFAULT_X_AXIS,
            gridIndex: axis.gridIndex ?? 0,
            offset: 10 +  AXIS_X_HEIGHT * accumulation.get(axis.gridIndex),
            nameTextStyle: {
                color: colors[axis.name] ?? '#000000',
                fontWeight: 'bold',
                fontSize: 14,
                padding: 6
            },
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
    }


    // Добавление шкал для линий
    const startGridLine = grids.length;
    const endGridLine = grids.length + grids.length - 1

    for (let i = startGridLine; i < endGridLine; i++) {
        result.push({
            name: `CENTER-${i}`,
            id: `CENTER-${i}`,
            nameTextStyle: {color: '#CD0D1F'},
            splitLine: {show: false},
            type: 'value',
            nameLocation: 'middle',
            position: 'top',
            axisLine: {onZero: false},
            min: 0,
            max: 1,
            gridIndex: i,
            show: false,
        },)
    }

    // Добавление шкалы для насыщения
    result.push({
        name: 'SATURATION',
        nameTextStyle: {color: '#CD0D1F'},
        splitLine: {show: false},
        type: 'category',
        nameLocation: 'end',
        position: 'top',
        axisLine: {onZero: false},
        min: 20,
        max: 20,
        gridIndex: endGridLine,
        show: false,
    },)

    return result
}