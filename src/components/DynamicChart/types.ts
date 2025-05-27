export interface IDynamicChartYData {
    data: number[];
    type?: 'line' | 'bar';
    name?: string;
    yAxisIndex?: number,
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
    yAxis?: IDynamicChartYAxis[]
}

export interface IDynamicChartOptions {
    showSliderX?: boolean
    chartHeight?: number
    syncTooltip?: boolean
    syncZoom?: boolean
    intervalSetting?: Record<number, number> // todo: прояснить что за number number
}

export interface IDataZoomParams {
    start: number
    end: number
    dataZoomId: string
    batch?: IDataZoomParams[]
}
