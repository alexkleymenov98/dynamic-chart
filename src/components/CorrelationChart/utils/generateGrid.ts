import type {EChartsOption} from "echarts";
import type {CorrelationChartData, CorrelationChartOptions} from "../CorrelationChart.types.ts";
import {TABLET_PADDING, TRACK_GAP} from "../CorrelationChart.consts.ts";

const BACKGROUND = '#F6F6F6'

export const generateGrid = (data: CorrelationChartData, options: CorrelationChartOptions): EChartsOption['grid'] => {
    const {grids} = data;

    const result: EChartsOption['grid'] = []

    for (const [index, track] of grids.entries()) {
        result.push({
            id: track.id,
            width: `${options.widthGrid}px`,
            left: `${TABLET_PADDING.LEFT + options.widthGrid * index + TRACK_GAP * index}px`,
            top: `${TABLET_PADDING.TOP}px`,
            bottom: `${TABLET_PADDING.BOTTOM}px`,
            show: true,
            borderWidth: 0,  // Скрываем внешнюю рамку
            backgroundColor: BACKGROUND,  // Фон области графика
        })
    }

    const countLineBetween = grids.length - 1

    // Добавление гридов для разделительных линий
    if (countLineBetween > 0) {
        let count = 0
        while (count < countLineBetween){
            count++

            result.push(
                {
                    id: `between-${count}`,
                    width: `${TRACK_GAP}px`,
                    left: `${TABLET_PADDING.LEFT + (count * options.widthGrid) + (TRACK_GAP * (count - 1))}px`,
                    top: `${TABLET_PADDING.TOP}px`,
                    bottom: `${TABLET_PADDING.BOTTOM}px`,
                    show: true,
                    borderWidth: 0,  // Скрываем внешнюю рамку
                    backgroundColor: BACKGROUND,  // Фон области графика
                }
            )
        }
    }
    // Добавление грид для насыщения
    result.push(
        {
            id: `saturation`,
            width: `${TABLET_PADDING.RIGHT}px`,
            right: '0px',
            top: `${TABLET_PADDING.TOP}px`,
            bottom: `${TABLET_PADDING.BOTTOM}px`,
            show: true,
            borderWidth: 0,  // Скрываем внешнюю рамку
            backgroundColor: '#E6E6E6',  // Фон области графика
        }
    )

    result.push(
        {
            id: `footer`,
            left: `${TABLET_PADDING.LEFT}`,
            right: `${TABLET_PADDING.RIGHT}`,
            bottom: `0px`,
            height: 30,
            show: true,
            borderWidth: 0,  // Скрываем внешнюю рамку
            backgroundColor: BACKGROUND,  // Фон области графика
        }
    )

    return result
}