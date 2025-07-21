import type {CorrelationChartOptions} from "./CorrelationChart.types.ts";

export const DEFAULT_OPTIONS :Required<CorrelationChartOptions> = {
    height: 600,
    widthGrid: 100,
    tabletGap: 30,
}

export const Y_AXIS_DEPTH_NAME = 'Глубины';
export const Y_AXIS_DEPTH_NAME_ABSOLUTE = 'А.О';
export const Y_AXIS_SATURATION_NAME = 'Насыщение';

export const CONNECT_LINE = 'CONNECT_LINE'

export const LINE_WIDTH = 3

export const TABLET_PADDING = {
    LEFT: 100,
    RIGHT: 50,
}

export const TRACK_GAP = 40