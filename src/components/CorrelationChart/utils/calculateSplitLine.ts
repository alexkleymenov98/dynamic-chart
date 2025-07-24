import type {CorrelationSplitLine} from "../CorrelationChart.types.ts";

export const generateSplitLine = (lines: Record<string, CorrelationSplitLine[]>, name: string, accumulated: Map<string, CorrelationSplitLine[]>) => {

    accumulated.set(name, lines[name].map((v) => ({...v})) ?? [])

    return accumulated
}


export const updateSplitLine = (accumulated: Map<string, CorrelationSplitLine[]>, nodeName: string, index: number, value: number) => {

    if (accumulated.has(nodeName)) {
        const temp = [...accumulated.get(nodeName) ?? []]
        temp[index].value = value

        accumulated.set(nodeName, temp)
    }

    return accumulated
}