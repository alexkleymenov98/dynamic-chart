import type {RefObject} from "react";
import type {LinkedListInstance} from "../LinkedList.ts";
import type {CorrelationSplitLine} from "../CorrelationChart.types.ts";
import {generatePointForZoom} from "./generatePointForZoom.ts";


export const moveSplitOnHorizontal = (
    chartInstances: RefObject<LinkedListInstance>,
    currentInstanceId: string,
    moveValue: number,
    lineName: string,
    accumulate: Map<string, CorrelationSplitLine[]>,
) => {

    chartInstances.current.forEach((instance, name) => {
        if (currentInstanceId !== instance.id) {
            const lines = accumulate.get(name) ?? []

            const line = lines.find((v) => v.name === lineName);

            if (line) {
                const diff = moveValue - line.value

                let startValue = generatePointForZoom(moveValue).startValue;
                let endValue = generatePointForZoom(moveValue).endValue;

                if (diff < 0) {
                    startValue = startValue + Math.abs(diff);
                    endValue = endValue + Math.abs(diff);
                } else {
                    startValue = startValue - Math.abs(diff);
                    endValue = endValue - Math.abs(diff);
                }


                instance.dispatchAction({
                    type: 'dataZoom',
                    startValue,
                    endValue,
                    dataZoomIndex: 0,
                }, {silent: true});

            }

        }
    })
}