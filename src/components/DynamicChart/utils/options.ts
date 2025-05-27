import type {EChartsOption} from "echarts";
import type {IDynamicChartData, IDynamicChartOptions} from "../types.ts";
import {defaultYAxis, defaultYZoom, POSITION_Y_LABEL, POSITION_Y_SCALE, stepValue} from "../consts.ts";


export const generateDynamicOption = (params:IDynamicChartData, options:IDynamicChartOptions):EChartsOption=>{
    return {
        grid: {
            ...generateGrid(params, options)
        },
        yAxis: generateYAxis(params),
        dataZoom: generateDataZoom(params, options),
        legend: {
            textStyle: {
                color: '#333',       // Цвет текста
                fontSize: 12,
                fontWeight: 'bold'
            },
            itemStyle: {
                borderWidth: 1,      // Граница иконок
                borderColor: '#ccc'
            },
            itemWidth: 25,         // Ширина иконки
            itemHeight: 14,         // Высота иконки
            left: Array.isArray(params?.yAxis) && params?.yAxis?.length > 3 ? stepValue * 2 : stepValue,
            bottom: 0,
            type: 'scroll',        // Активирует прокрутку
            pageButtonItemGap: 5,  // Расстояние между кнопками
            pageIconColor: '#2f4554',
            pageIconInactiveColor: '#aaa',
            pageTextStyle: {
                color: '#333'
            }
        }
    }
}

const generateYAxis = (params:IDynamicChartData):EChartsOption['yAxis']=>{
    const {yAxis} = params

    if(yAxis){
        const yAxisArray: EChartsOption['yAxis'] = []

        if(!Array.isArray(yAxis)){
            yAxisArray.push(yAxis)
        } else {

          for(let i = 0; i < yAxis.length; i++){
              const currentYAxis = yAxis[i]

              const isPositionRight = i === 1 || i === 2

              const offset = getOffsetPositionLabelYOnIndex(i, yAxis.length)

              if(typeof currentYAxis === 'object'){
                  yAxisArray.push({
                      ...defaultYAxis,
                      position: isPositionRight ? 'right': 'left',
                      offset,
                      ...yAxis[i],
                  })
              }
          }
        }

        return yAxisArray
    }

    return [{...defaultYAxis, position: 'left'}]
}

const generateGrid = (params:IDynamicChartData, options:IDynamicChartOptions):EChartsOption['grid'] =>{
    const step = stepValue

    let bottom = 100

    const { showSliderX } = options

    if(showSliderX){
        bottom = 140
    }

    const {yAxis} = params

    if(!yAxis || !Array.isArray(yAxis) || yAxis.length === 1){
        return {
            left: step,
            right: 0,
            bottom,
        }
    }

    if(yAxis.length === 2){
        return {
            left: step,
            right: step,
            bottom,
        }
    }

    if(yAxis.length === 3){
        return {
            left: step,
            right: step * 2,
            bottom,
        }
    }


    return {
        left: step * 2,
        right: step * 2,
        bottom,
    }
}

const generateDataZoom = (params:IDynamicChartData, options?:IDynamicChartOptions):EChartsOption['dataZoom']=>{

    const result: EChartsOption['dataZoom'] = [
        {
            id: 'dataZoomX__inside',
            type: 'inside',
            xAxisIndex: [0],
            filterMode: 'none',
            minSpan:3,
        },
    ]

    if(options?.showSliderX){
        result.push({
            id: 'dataZoomX__slider',
            type: 'slider',
            xAxisIndex: [0],
            filterMode: 'none',
            bottom: 30,
        },)
    }

    const {yAxis} = params

    if(!yAxis) {
        result.push({...defaultYZoom, yAxisIndex: [0],left: 0})
    }

    if(yAxis && Array.isArray(yAxis)){
        for(let i = 0; i < yAxis.length; i++){
            result.push({...defaultYZoom, id: `dataZoomY__slider-${i}`, yAxisIndex: [i],...getPositionOnIndex(i, yAxis.length)})
        }
    }

    return result
}

export const getPositionOnIndex = (index: number, len: number):Record<'right', number>|Record<'left', number>=>{
    const valueArray = POSITION_Y_SCALE.get(len) ?? [0,0, 0,0]


    const values:[number, number] = valueArray[index] as [number, number] ?? [0,0]

    const value = values[1]

    if(index === 0 || index === 3){
        return  {left: value}
    }

    return  {right: value}
}

const getOffsetPositionLabelYOnIndex = (index: number, len: number)=>{
    const valuesFromMap = POSITION_Y_LABEL.get(len) ?? [0,0,0,0]

    const values:[number, number] = valuesFromMap[index] as [number, number] ?? [0,0]

    return  values[1]
}

interface GenerateOptionsAxisXProps  {
    data?: string[]
    interval?: number
}

export const generateOptionsAxisX = ({data, interval}:GenerateOptionsAxisXProps): EChartsOption['xAxis']=>({
    type: 'category',
    data,
    axisLine: { onZero: false },
    axisLabel: {
        rotate: 90,
        interval: interval,
    },
    axisTick: {
        alignWithLabel: true
    }
})