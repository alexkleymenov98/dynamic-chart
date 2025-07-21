import type {EChartsOption} from "echarts";

export const groupSyncYAxis = (yAxis: EChartsOption['yAxis'], ...names: string[]): number[] => {
    const result: number[] = []

    if (!Array.isArray(yAxis)) {
        return result
    }

    for (const [index, axis] of yAxis.entries()) {
        if (names.includes(axis.name as string)) {
            result.push(index)
        }
    }

    return result
}