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

export type CorrelationChartData = {
    name: string
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
    width: number
    height: number
    tabletGap: number
}