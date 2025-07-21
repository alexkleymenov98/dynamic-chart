import type {CorrelationSplitLine, SplitPosition} from "../CorrelationChart.types.ts";

export const generateSplitLine = (lines: Record<string, CorrelationSplitLine[]>, name: string, accumulated: Map<string, SplitPosition[]>): Map<string, SplitPosition[]> => {

    accumulated.set(name, lines[name].map(({value}) => Number(value)) ?? [])

    return accumulated
}


export const updateSplitLine = (accumulated: Map<string, SplitPosition[]>, nodeName: string, index: number, value: number) => {

    if (accumulated.has(nodeName)) {
        const temp = [...accumulated.get(nodeName) ?? []]
        temp[index] = value

        accumulated.set(nodeName, temp)
    }

    return accumulated
}