import type {EChartsOption} from "echarts";
import type {CorrelationChartData} from "../CorrelationChart.types.ts";

export const generateSeriesBetweenGrid = (data: CorrelationChartData) => {
    const result: EChartsOption['series'] = []

    const {grids, xAxis, saturation} = data;

    let xIndex = xAxis.length;

    let startYIndex = grids.length * 2;
    const endYIndex = startYIndex + grids.length

    while (startYIndex < endYIndex) {
        result.push({
            name: `CENTER-MARK-LINE-${startYIndex}-${xIndex}`,
            animation: false,
            type: 'line',
            xAxisIndex: xIndex,
            yAxisIndex: startYIndex,
            markLine: {
                silent: true,
                label: {show: false},
                symbol: 'none',
                lineStyle: {color: '#cccccc', width: 1, type: 'solid'},
                data: [{xAxis: 0.5}]
            }
        })
        startYIndex += 2
        xIndex++
    }

    // Добавление насыщения
    result.push(
        {
            name: `facies`,
            type: 'line',
            data: saturation,
            dimensions: ['depth', 'facie'],
            encode: {
                y: 0,
                x: 1,
                tooltip: [0, 1]
            },
            showSymbol: false,
            lineStyle: {width: 20},
            xAxisIndex: xIndex,
            yAxisIndex: startYIndex,
            animation: false,
            connectNulls: false
        }
    )

    return result
}