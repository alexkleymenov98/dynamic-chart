import {CorrelationChart} from "./CorrelationChart.tsx";
import type {CorrelationChartData, CorrelationSplitLine} from "./CorrelationChart.types.ts";

const mock: CorrelationChartData[] = [
    {
        name: '1002'
    },
    {
        name: '1003'
    },
    {
        name: '1004'
    },
]

const mockSplitLines: Record<string, CorrelationSplitLine[]> = {
    "1002": [{
        id: 'pk-1002',
        name: 'Кровля ПК',
        color: 'red',
        type: 'dashed',
        value: '200',
        well: '1002',
    },
        {
            id: 'pkt-1002',
            name: 'ПКТ_Кровля',
            color: 'blue',
            type: 'solid',
            value: '400',
            well: '1002',
        },
        {
            id: 'pk1-1002',
            name: 'ПК1_подошва',
            color: 'green',
            type: 'solid',
            value: '500',
            well: '1002',
        },],
    "1003":[{
        id: 'pk-1003',
        name: 'Кровля ПК',
        color: 'red',
        type: 'dashed',
        value: '250',
        well: '1003',
    },
        {
            id: 'pkt-1003',
            name: 'ПКТ_Кровля',
            color: 'blue',
            type: 'solid',
            value: '300',
            well: '1003',
        },
        {
            id: 'pk1-1003',
            name: 'ПК1_подошва',
            color: 'green',
            type: 'solid',
            value: '450',
            well: '1003',
        },],
    "1004":[{
        id: 'pk-1004',
        name: 'Кровля ПК',
        color: 'red',
        type: 'dashed',
        value: '200',
        well: '1004',
    },
        {
            id: 'pkt-1004',
            name: 'ПКТ_Кровля',
            color: 'blue',
            type: 'solid',
            value: '350',
            well: '1004',
        },
        {
            id: 'pk1-1004',
            name: 'ПК1_подошва',
            color: 'green',
            type: 'solid',
            value: '500',
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