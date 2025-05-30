import type {IDynamicChartData} from "../types.ts";

export const getYAxisMaxCount = (values:IDynamicChartData[] ):number=>{
    let  max = 1

    for(let i = 1; i < values.length; i++){
        const chart = values[i]

        if(max < Number(chart?.yAxis?.length)){
            max = Number(chart?.yAxis?.length)
        }
    }

    return  max
}