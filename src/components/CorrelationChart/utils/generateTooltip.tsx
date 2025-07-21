import type {EChartsOption} from "echarts";
import type {CorrelationChartData, TFacieId} from "../CorrelationChart.types.ts";
import {facieToColor, facieToName} from "../CorrelationChart.utils.ts";
import type {CallbackDataParams} from "echarts/types/dist/shared";

export const generateTooltip = (data: CorrelationChartData, colorsValue: Record<string, string>): EChartsOption['tooltip'] => {
    const {saturation} = data
    return {
        trigger: 'axis',
        axisPointer: {type: 'line', axis: 'y', snap: false,},
        formatter: (_params) => {
            const params = _params as CallbackDataParams
            if (!Array.isArray(params)) {
                return ''
            }

            const depthValue = params[0]?.axisValue ?? 0;
            const depth = `<div>А.О. ${depthValue}</div>`;

            const facieValue = saturation.find(([start], index) => {
                if (depthValue < start) {
                    return false
                }
                const next = saturation[index + 1] ?? [];
                const nextStart = next[0] ?? Infinity;
                return depthValue <= nextStart;
            })

            let faciesContent = '';

            if (facieValue) {
                const facieId = facieValue[1] as TFacieId;
                if (facieId !== -9999) {
                    const facieName = facieToName[facieId];
                    const marker = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${facieToColor[facieId]};"></span>`
                    faciesContent = `<div>${marker} ${facieName}</div>`
                }
            }

            const curvesContent = params
                .filter(({seriesName}) => seriesName !== 'facies')
                .map(({seriesName, data, seriesId, color}) => {
                    const marker = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${colorsValue[seriesId] ?? color};"></span>`
                    return `<div>${marker} ${seriesName} ${data[0]}</div>`
                }).join('\n')

            return `<div>${depth}${faciesContent}<br />${curvesContent}</div>`
        }
    }
}