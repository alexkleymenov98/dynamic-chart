import './App.css'

import { DynamicChart } from './components/DynamicChart'

const FROM_YEAR = 2000;
const yearData = Array.from({ length: 10 }, (_v, year) => {
    return Array.from({ length: 12 }, (_v, month) => {
        return `01.${String(month + 1).padStart(2, '0')}.${year + FROM_YEAR}`
    })
}).flat();

const getRandomValues = (length: number) => {
    return Array.from({ length }, () => Math.round(Math.random() * 1000));
}

function App() {
    return <div style={{ width: '100%', height: '100%' }}>
        <DynamicChart
            options={{
                showSliderX: false,
                chartHeight: 500,
                syncZoom: true,
                syncTooltip: true,
                intervalSetting: {
                    10: 4,
                    3: 2,
                    1: 1
                }
            }}
            data={[
                {
                    yAxis: [{
                        id: 0,
                        name: 'Шкала 1'
                    }
                    ],
                    name: 'Добыча нефти',
                    xData: yearData,
                    yData: [
                        { data: getRandomValues(yearData.length), name: 'Нефть', color: 'red', yAxisIndex: 0 },
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
                        { data: getRandomValues(yearData.length), name: 'Нефть', color: 'red', yAxisIndex: 0 },
                        { data: getRandomValues(yearData.length), name: 'Вода', color: 'blue', yAxisIndex: 1 },
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
                        { data: getRandomValues(yearData.length), name: 'Нефть', color: 'red', yAxisIndex: 0 },
                        { data: getRandomValues(yearData.length), name: 'Вода', color: 'blue', yAxisIndex: 1 },
                        { data: getRandomValues(yearData.length), name: 'Газ', color: 'black', yAxisIndex: 2 },
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
                        { data: getRandomValues(yearData.length), name: 'Нефть', color: 'red', yAxisIndex: 0 },
                        { data: getRandomValues(yearData.length), name: 'Вода', color: 'blue', yAxisIndex: 1 },
                        { data: getRandomValues(yearData.length), name: 'Газ', color: 'black', yAxisIndex: 2 },
                        { data: getRandomValues(yearData.length), name: 'Фосфор', color: 'yellow', yAxisIndex: 3 },
                    ],
                },

            ]}
            render={charts =>
                (<div>{charts.map((chart, index) =>
                    <div style={{ marginBottom: '15px' }}
                         key={index}
                         children={chart}
                    />
                )}</div>)}
        />
    </div>
}

export default App
