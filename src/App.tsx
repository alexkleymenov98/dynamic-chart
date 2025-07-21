import './App.css'

import {DynamicChart} from './components/DynamicChart'
import {type ChangeEvent, useCallback, useMemo, useState} from "react";
import {useDownloadToPng} from "./hooks/useDownloadToPng.ts";
import {CorrelationWrapper} from "./components/CorrelationChart/CorrelationWrapper.tsx";
import {CorrelationChartDev} from "./components/CorrelationChart/CorrelationChartDev.tsx";

const FROM_YEAR = 2000;
const yearData = Array.from({length: 10}, (_v, year) => {
    return Array.from({length: 12}, (_v, month) => {
        return `01.${String(month + 1).padStart(2, '0')}.${year + FROM_YEAR}`
    })
}).flat();

const getRandomValues = (length: number) => {
    return Array.from({length}, () => Math.round(Math.random() * 1000));
}

const momoizeOption = {
    showSliderX: false,
    chartHeight: 500,
    syncZoom: true,
    syncTooltip: true,
    intervalSetting: {
        10: 4,
        3: 2,
        1: 1
    }
}

const data = [
    {
        yAxis: [{
            id: 0,
            name: 'Шкала 1'
        }
        ],
        name: 'Добыча нефти',
        xData: yearData,
        yData: [
            {data: getRandomValues(yearData.length), name: 'Нефть', color: 'red', yAxisIndex: 0},
        ],
    },
    {
        yAxis: [{
            id: 0,
            name: 'Шкала 1'
        },
            {
                id: 1,
                name: 'Шкала 2'
            },
        ],
        name: 'Добыча воды',
        xData: yearData,
        yData: [
            {data: getRandomValues(yearData.length), name: 'Нефть', color: 'red', yAxisIndex: 0},
            {data: getRandomValues(yearData.length), name: 'Вода', color: 'blue', yAxisIndex: 1},
        ],
    },
    {
        yAxis: [{
            id: 0,
            name: 'Шкала 1'
        },
            {
                id: 1,
                name: 'Шкала 2'
            },
            {
                id: 2,
                name: 'Шкала 3'
            },
        ],
        name: 'Добыча газа',
        xData: yearData,
        yData: [
            {data: getRandomValues(yearData.length), name: 'Нефть', color: 'red', yAxisIndex: 0},
            {data: getRandomValues(yearData.length), name: 'Вода', color: 'blue', yAxisIndex: 1},
            {data: getRandomValues(yearData.length), name: 'Газ', color: 'black', yAxisIndex: 2},
        ],
    },
    {
        yAxis: [{
            id: 0,
            name: 'Шкала 1'
        },
            {
                id: 1,
                name: 'Шкала 2'
            },
            {
                id: 2,
                name: 'Шкала 3'
            },
            {
                id: 3,
                name: 'Шкала 4'
            }
        ],
        name: 'Добыча жидкости',
        xData: yearData,
        yData: [
            {data: getRandomValues(yearData.length), name: 'Нефть', color: 'red', yAxisIndex: 0},
            {data: getRandomValues(yearData.length), name: 'Вода', color: 'blue', yAxisIndex: 1},
            {data: getRandomValues(yearData.length), name: 'Газ', color: 'black', yAxisIndex: 2},
            {data: getRandomValues(yearData.length), name: 'Фосфор', color: 'yellow', yAxisIndex: 3},
        ],
    },

]

function App() {
    const {onDownloadToPNG, elementRef} = useDownloadToPng({fileName: 'Графики'})
    const [charts, setCharts] = useState({
        0: false,
        1: false,
        2: false,
        3: false,
    });

    const onChangeEvent = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setCharts((prev) => ({...prev, [event.target.id]: event.target.checked}))
    }, [])

    const filtredData = useMemo(() => {
        return data.filter((_, i) => {
            return charts?.[i as 0 | 1 | 2 | 3] ?? false
        })
    }, [charts, data])

    return <div style={{width: '100%', height: '100%'}}>
        <label htmlFor="0"><input id="0" onChange={onChangeEvent} type='checkbox'/> Добыча нефти</label>
        <label htmlFor="1"><input id="1" onChange={onChangeEvent} type='checkbox'/> Добыча воды</label>
        <label htmlFor="2"><input id="2" onChange={onChangeEvent} type='checkbox'/> Добыча газа</label>
        <label htmlFor="3"><input id="3" onChange={onChangeEvent} type='checkbox'/> Добыча жидкости</label>
        <button onClick={onDownloadToPNG}>Скачать PNG</button>
        <DynamicChart
            ref={elementRef}
            memoizeOptions={momoizeOption}
            data={filtredData}
            render={charts =>
                (<div>{charts.map((chart, index) =>
                    <div style={{marginBottom: '15px'}}
                         key={index}
                         children={chart}
                    />
                )}</div>)}
        />
        <CorrelationWrapper/>
    </div>
}

export default App
