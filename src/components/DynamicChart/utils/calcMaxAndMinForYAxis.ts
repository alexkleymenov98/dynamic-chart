import type {IDynamicChartData, IMinAndMaxValueYAxis} from "../types.ts";
import {DEFAULT_MIN_MAX} from "../consts.ts";


export const calcMaxAndMinForYAxis = (data: IDynamicChartData): IMinAndMaxValueYAxis => {
    const xDateLength = data.xData.length ?? 0

    if (!xDateLength) {
        return DEFAULT_MIN_MAX
    }

    let minValue = null;
    let maxValue = null;

    const yData = data.yData;

    for (let i = 0; i < yData.length; i++) {
        const lines = yData[i]

        for (let j = 0; j < lines.data.length; j++) {
            const value = lines.data[j]

            if (!maxValue) {
                maxValue = value
            } else if (value > maxValue) {
                maxValue = value
            }

            if (!minValue) {
                minValue = value
            } else if (value < minValue) {
                minValue = value
            }

        }
    }

    const delta = Number(maxValue) - Number(minValue)

    return {
        minValueY: Number(minValue) - delta,
        maxValueY: Number(maxValue) + delta
    }
}