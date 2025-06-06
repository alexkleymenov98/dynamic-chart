import type { EChartsOption } from 'echarts';
import type {
  IDynamicChartOptions,
  IMinAndMaxValueYAxis,
  TAxisYCoordinate,
  TAxisYLength,
  TInternalSetting,
} from './DynamicChart.types.ts';

export const STEP_VALUE = 50;

export const DIRECTIONS = {
  LEFT: 'left',
  RIGHT: 'right',
} as const;

export const POSITION_Y_LABEL = new Map<TAxisYLength, TAxisYCoordinate>([
  [1, [
    [0, 40],
  ]],
  [2, [
    [0, 40],
    [1, 10],
  ]],
  [3, [
    [0, 40],
    [1, 25],
    [2, 65],
  ]],
  [4, [
    [0, 90],
    [1, 25],
    [2, 65],
    [3, 45],
  ]],
]);

export const POSITION_Y_SCALE = new Map<TAxisYLength, TAxisYCoordinate>([
  [1, [
    [0, 20],
  ]],
  [2, [
    [0, 20],
    [1, 15],
  ]],
  [3, [
    [0, 20],
    [1, 50],
    [2, 10],
  ]],
  [4, [
    [0, 20],
    [1, 50],
    [2, 10],
    [3, 60],
  ]],
]);

export const DEFAULT_Y_AXIS: EChartsOption['yAxis'] = {
  position: DIRECTIONS.LEFT,
  type: 'value',
  nameLocation: 'end',
  nameGap: 5,
  nameRotate: 90,
  nameTextStyle: {
    align: 'right', // Выравнивание для вертикального текста
  },
  splitLine: {
    show: false,
  },
  axisLine: { onZero: false },
  axisLabel: { show: false },
};

export const DEFAULT_Y_AXIS_FOR_BG: EChartsOption['yAxis'] = {
  splitLine: {
    show: true,
  },
  axisLine: { onZero: false },
  axisLabel: { show: false },
};

export const DEFAULT_Y_ZOOM: Partial<EChartsOption['dataZoom']> = {
  id: 'dataZoomY__slider',
  type: 'slider',
  filterMode: 'none',
  handleLabel: {
    show: true,
  },
  dataBackground: {
    areaStyle: { opacity: 0 },
    lineStyle: { opacity: 0 },
  },
  selectedDataBackground: {
    areaStyle: { opacity: 0 },
    lineStyle: { opacity: 0 },
  },
  width: 15,
  minSpan: 20,
  handleIcon: 'M10 10 A5 5 0 1 0 20 10 A5 5 0 1 0 10 10',
  handleSize: '80%',
  handleStyle: {
    color: '#fff',
    shadowBlur: 3,
    shadowColor: 'rgba(0, 0, 0, 0.6)',
    shadowOffsetX: 1,
    shadowOffsetY: 2,
  },
  fillerColor: 'rgba(67, 128, 255, 0.2)',
  borderColor: '#ddd',
  backgroundColor: '#f5f5f5',
  textStyle: {
    color: '#333',
  },
};

const DEFAULT_INTERVAL_FOR_AXIS_X: TInternalSetting = {
  10: 4,
  3: 2,
  1: 1,
};

export const DEFAULT_CHART_OPTIONS: Required<IDynamicChartOptions> = {
  showSliderX: false,
  chartHeight: 350,
  syncTooltip: true,
  syncZoom: true,
  intervalSetting: DEFAULT_INTERVAL_FOR_AXIS_X,
  showBackgroundLine: true,
};

export const DEFAULT_MIN_MAX: IMinAndMaxValueYAxis = {
  minValueY: 0,
  maxValueY: 1000,
};

export const AXIS_POINTER_POSITION = [0, 0, 10, -40]
