import type {EChartsOption} from "echarts";

export interface IDynamicChartYData {
    data: number[];
    type?: 'line'| 'bar';
    name?: string;
    yAxisIndex?: number,
    areaStyle?: Record<string, string>,
    color?: string
}

export interface IDynamicChartYAxis {
    id: number
    name: string
}

export interface IDynamicChartData {
    xData: string[];
    yData: IDynamicChartYData[];
    name?: string
    yAxis?:EChartsOption['yAxis'] | IDynamicChartYAxis[]
}

export interface IDynamicChartOptions {
    showSliderX?: boolean
    chartHeight?: number
    syncTooltip?: boolean
    syncZoom?: boolean
    intervalSetting?: Record<number, number>
}