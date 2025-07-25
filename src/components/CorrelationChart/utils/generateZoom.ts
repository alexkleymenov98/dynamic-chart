import type {
    CorrelationChartData,
    CorrelationChartWithInnerOptions
} from "../CorrelationChart.types.ts";
import type {EChartsOption} from "echarts";
import {AXIS_X_HEIGHT} from "../CorrelationChart.consts.ts";

export const generateZoom = (data: CorrelationChartData, options: CorrelationChartWithInnerOptions, colorsValues: Record<string, string>) => {
    const result: EChartsOption['dataZoom'] = []

    const {xAxis} = data

    const accumulation = new Map()

    for (const [index, axis] of xAxis.entries()) {

        if (accumulation.has(axis.gridIndex)) {
            accumulation.set(axis.gridIndex, accumulation.get(axis.gridIndex) + 1)
        } else {
            accumulation.set(axis.gridIndex, 0)
        }

        result.push({
            id: `dataZoomX__inside-${axis.name}`,
            type: 'inside',
            xAxisIndex: index,
            filterMode: 'none',
            minSpan: 3,
        },)
        result.push({
            id: `dataZoomX__slider-${axis.name}`,
            name: axis.name,
            type: 'slider',
            xAxisIndex: index,
            filterMode: 'filter',
            handleLabel: {show: true},
            dataBackground: {areaStyle: {opacity: 0, color: 'red'}, lineStyle: {opacity: 0, color: 'red'}},
            selectedDataBackground: {areaStyle: {opacity: 0}, lineStyle: {opacity: 0}},
            minSpan: 20,
            width: options.widthGrid - 20,
            height: 15,
            handleIcon: 'M10 10 A5 5 0 1 0 20 10 A5 5 0 1 0 10 10',
            handleSize: '80%',
            handleStyle: {
                color: '#fff',
                shadowBlur: 3,
                shadowColor: colorsValues[axis.name],
                shadowOffsetX: 1,
                shadowOffsetY: 2,
            },
            fillerColor: colorsValues[axis.name],
            borderColor: '#ddd',
            backgroundColor: '#f5f5f5',
            textStyle: {color: '#333'},
            bottom: options.height - options.gridPaddingTop + 10 + AXIS_X_HEIGHT * accumulation.get(axis.gridIndex),
        })
    }

    return result;
}