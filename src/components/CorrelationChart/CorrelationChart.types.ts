import type {EChartsType} from "echarts/core";

export type TColor = string;
export type TFacieId = 1 | 2 | 3 | 4 | 5 | 9 | -9999;
export type TMinMax = {
    min: number;
    max: number;
}

export type DoubleListNode<T> = {
    prev: DoubleListNode<T> | null
    value: T;
    next: DoubleListNode<T> | null
}

export type ListNodeInstances = {name: string, instance: EChartsType}

export type TData = {
    name: string
    value: TMinMax
    depth: TMinMax
    color: string
}

export type CorrelationGrid = {
    id: number
}

export type CorrelationXAxis = {
    name: string
    gridIndex: number
}


export type CorrelationData = {
    name: string
    color: string
    data: number[][]
    xAxisIndex: number
    gridIndex: number
    yAxisIndex: number
}

export type CorrelationChartData = {
    name: string
    grids: CorrelationGrid[]
    xAxis: CorrelationXAxis[]
    data: CorrelationData[]
    saturation: number[][]
}

export type CorrelationSplitLine = {
    id: string
    value: string
    name: string
    color: string
    type: string
    well: string
}

export type CorrelationChartOptions = {
    widthGrid: number
    height: number
    tabletGap: number
}