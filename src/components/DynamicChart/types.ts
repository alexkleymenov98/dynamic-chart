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

type TInternalYearsPeriod = number

type TInternalCount = number

export type TInternalSetting = Record<TInternalYearsPeriod, TInternalCount>

export interface IDynamicChartOptions {
    showSliderX?: boolean
    chartHeight?: number
    syncTooltip?: boolean
    syncZoom?: boolean
    intervalSetting?: TInternalSetting
}


export interface IMinAndMaxValueYAxis {
    minValueY: number
    maxValueY: number
}

export interface IDynamicChartWithInnerOptions extends Required<IDynamicChartOptions> {
    yAxisMaxLength: number
}

export interface IDataZoomParams {
    start: number
    end: number
    dataZoomId: string
    batch?: IDataZoomParams[]
}

export type TAxisYLength = 1 | 2 | 3 | 4

export type TAxisYCoordinate = Array<[number, number]>