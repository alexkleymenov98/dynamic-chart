import {CorrelationChart} from "./CorrelationChart.tsx";
import type {CorrelationChartData, CorrelationSplitLine} from "./CorrelationChart.types.ts";
import {getGisData, getRandomFacie, splitRangeIntoRandomIntervals} from "./CorrelationChart.utils.ts";

const faciesIntervals = splitRangeIntoRandomIntervals(0.1, 1800, 20).map(([start]) => [start, getRandomFacie()])

const saturationData = faciesIntervals.map(([start]) => [start, getRandomFacie()])


const mock: CorrelationChartData[] = [
    {
        saturation: saturationData,
        name: '1002',
        grids: [{
            id: 0,
        }, {
            id: 1,
        }],
        xAxis: [{
            name: 'ГК',
            gridIndex: 0,
        },
            {
                name: 'НК',
                gridIndex: 0,
            },
            {
                name: 'ПС',
                gridIndex: 1,
            },
        ],
        data: [{
            name: 'ГК',
            data: getGisData(15_000, 0.1, 1500, {min: 0.1, max: 1500, fractionDigits: 1}),
            color: 'red',
            xAxisIndex: 0,
            gridIndex: 0,
            yAxisIndex: 0,
        },
            {
                name: 'НК',
                data: getGisData(15_000, 0.1, 1500, {min: 0.1, max: 1500, fractionDigits: 1}),
                color: 'blue',
                xAxisIndex: 1,
                gridIndex: 0,
                yAxisIndex: 0,
            },
            {
                name: 'ПС',
                data: getGisData(15_000, 0.1, 1500, {min: 0.1, max: 1500, fractionDigits: 1}),
                color: 'green',
                xAxisIndex: 2,
                gridIndex: 1,
                yAxisIndex: 0,
            }
        ],
    },
    {
        saturation: saturationData,
        name: '1003',
        grids: [{
            id: 0,
        }, {
            id: 1,
        },
            {
                id: 2,
            }],
        xAxis: [{
            name: 'ГК',
            gridIndex: 0,
        },
            {
                name: 'НК',
                gridIndex: 2,
            },
            {
                name: 'ПС',
                gridIndex: 1,
            }
        ],
        data: [
            {
                name: 'ГК',
                data: getGisData(15_000, 0.1, 1500, {min: 0.1, max: 1500, fractionDigits: 1}),
                color: 'red',
                xAxisIndex: 0,
                gridIndex: 0,
                yAxisIndex: 0,
            },
            {
                name: 'НК',
                data: getGisData(15_000, 0.1, 1500, {min: 0.1, max: 1500, fractionDigits: 1}),
                color: 'orange',
                xAxisIndex: 1,
                gridIndex: 2,
                yAxisIndex: 0,
            },
            {
                name: 'ПС',
                data: getGisData(15_000, 0.1, 1500, {min: 0.1, max: 1500, fractionDigits: 1}),
                color: 'green',
                xAxisIndex: 2,
                gridIndex: 1,
                yAxisIndex: 0,
            }
        ],
    },
]

const mockSplitLines: Record<string, CorrelationSplitLine[]> = {
    "1002": [{
        id: 'pk-1002',
        name: 'Кровля ПК',
        color: 'red',
        type: 'dashed',
        value: 300,
        well: '1002',
    },
        {
            id: 'pkt-1002',
            name: 'ПКТ_Кровля',
            color: 'blue',
            type: 'solid',
            value: 600,
            well: '1002',
        },
        {
            id: 'pk1-1002',
            name: 'ПК1_подошва',
            color: 'green',
            type: 'solid',
            value: 1400,
            well: '1002',
        },],
    "1003": [{
        id: 'pk-1003',
        name: 'Кровля ПК',
        color: 'red',
        type: 'dashed',
        value: 300,
        well: '1003',
    },
        {
            id: 'pkt-1003',
            name: 'ПКТ_Кровля',
            color: 'blue',
            type: 'solid',
            value: 1000,
            well: '1003',
        },
        {
            id: 'pk1-1003',
            name: 'ПК1_подошва',
            color: 'green',
            type: 'solid',
            value: 1500,
            well: '1003',
        },],
    "1004": [{
        id: 'pk-1004',
        name: 'Кровля ПК',
        color: 'red',
        type: 'dashed',
        value: 400,
        well: '1004',
    },
        {
            id: 'pkt-1004',
            name: 'ПКТ_Кровля',
            color: 'blue',
            type: 'solid',
            value: 350,
            well: '1004',
        },
        {
            id: 'pk1-1004',
            name: 'ПК1_подошва',
            color: 'green',
            type: 'solid',
            value: 1000,
            well: '1004',
        },]
}


export const CorrelationWrapper = () => {
    return <CorrelationChart data={mock} splitLines={mockSplitLines} render={charts =>
        (<div style={{overflowX: 'auto', width: '100%'}}>
            <div style={{display: 'flex'}}>{charts.map((chart, index) =>
                <div
                    style={{display: 'flex'}}
                    key={index}
                    children={chart}
                />
            )}</div>
        </div>)}/>
}