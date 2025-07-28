import type {DataZoomOption} from "../CorrelationChart.types.ts";

export const generatePointForZoom = (value: number, zoom?:DataZoomOption)=>{
    let startValue = value * 0.5;
    let endValue = value * 1.5;

    if(zoom){
        const endValueZoom = zoom.endValue;
        const startValueZoom = zoom.startValue;

        startValue = Math.max(startValue, startValueZoom);
        endValue = Math.min(endValueZoom, endValue);
    }

    return {
        startValue,
        endValue
    }
}