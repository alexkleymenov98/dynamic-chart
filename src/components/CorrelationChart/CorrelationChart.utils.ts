import {faker} from '@faker-js/faker';
import type {
    CorrelationChartOptions,
    CorrelationSplitLine,
    ListNodeInstances,
    TColor,
    TFacieId
} from './CorrelationChart.types.ts';
import type {EChartsOption} from "echarts";
import type {ListNode} from "./LinkedList.ts";
import {LINE_WIDTH} from "./CorrelationChart.consts.ts";

export function generateSmoothData(count: number, step: number, initialDepth: number, {min, max, fractionDigits}: {
    min: number,
    max: number,
    fractionDigits: number
}) {
    let current = faker.number.float({min, max: max / 2, fractionDigits});
    const data = [];

    for (let i = 0; i < count; i++) {
        // Плавное изменение с небольшими случайными колебаниями
        current += faker.number.float({min: -5, max: 5, fractionDigits});
        current = Number(Math.max(min, Math.min(max, current)).toFixed(fractionDigits)); // Ограничиваем min/max
        data.push([
                Number(((i + initialDepth) * step).toFixed(3)), // или faker.date.recent() для временных данных
                current,
            ]
        );
    }

    return data;
}

export const getMinAndMaxDepth = (...args: (number[][])[]) => {
    const min = Math.min(...args.map((depth) => depth[0][0]))
    const max = Math.max(...args.map((depth) => depth[depth.length - 1][0]))
    return {min, max}
}

export function splitRangeIntoRandomIntervals(min: number, max: number, numberOfIntervals: number) {
    // Если нужен только один интервал - возвращаем весь диапазон
    if (numberOfIntervals === 1) {
        return [[min, max]];
    }

    // Генерируем случайные точки разбиения (отсортированные)
    const splitPoints = [];
    for (let i = 0; i < numberOfIntervals - 1; i++) {
        // Генерируем точку между min и max, не включая границы
        const point = Math.floor(Math.random() * (max - min - 1)) + min + 1;
        splitPoints.push(point);
    }

    // Сортируем точки разбиения
    splitPoints.sort((a, b) => a - b);

    // Создаем интервалы на основе точек разбиения
    const intervals = [];
    let currentMin = min;

    for (const point of splitPoints) {
        intervals.push([currentMin, point]);
        currentMin = point + 1;
    }

    // Добавляем последний интервал
    intervals.push([currentMin, max]);

    return intervals;
}

export function getRandomElement<T>(arr: T[]): T {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

export const getRandomFacie = () => {
    return Number(getRandomElement(Object.keys(facieToColor)));
}

export function uuid4(): string {
    const {crypto} = window;
    if (typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

/*
    1       Нефть                       Коричневый
    2       Газ                         Желтый
    3       Газ+нефть                   Оранжевый
    4       Нефть+вода                  Зеленый
    5       Вода                        Голубой
    9       Неколлектор                 Серый
    -9999   Не отображается в легенде   Нет (белый)
 */
export const facieToColor: Record<TFacieId, TColor> = {
    1: '#964B00',       // Нефть
    2: '#FFFF00',       // Газ
    3: '#FF8000',       // Газ+нефть
    4: '#00FF00',       // Нефть+вода
    5: '#00BFFF',       // Вода
    9: '#808080',       // Неколлектор
    [-9999]: '#FFFFFF' //  Не отображается в легенде
}

export const facieToName: Record<TFacieId, string> = {
    1: 'Нефть',
    2: 'Газ',
    3: 'Газ+нефть',
    4: 'Нефть+вода',
    5: 'Вода',
    9: 'Неколлектор',
    [-9999]: 'Не отображается в легенде',
}

export const getGisData = (count: number, step: number, initialDepth: number, {min, max, fractionDigits}: {
    min: number,
    max: number,
    fractionDigits: number
}) => {
    return generateSmoothData(count, step, initialDepth, {min, max, fractionDigits})
}


export const convertLinesToElements = (lines: CorrelationSplitLine[], width: number) => {
    const elements: EChartsOption['graphic'] = []

    for (const line of lines) {
        const configLine: typeof elements[number] = {
            name: line.name,
            id: line.id,
            type: 'line',
            draggable: true,
            shape: {
                x1: 0,
                y1: Number(line.value),
                x2: width,
                y2: Number(line.value)
            },
            style: {
                stroke: line.color,
                lineWidth: LINE_WIDTH,
                lineDash: [],
            },

        }
        if (line.type === 'dashed') {
            configLine.style!.lineDash = [5, 5]
        }
        elements.push({
            type: 'text',
            right: 5,
            top: Number(line.value) - 20,
            style: {
                text: line.name, // Текст подписи
            }
        },)
        elements.push(
            configLine
        )
    }

    return elements
}


export const generateConnectLineElements = (node: ListNode<ListNodeInstances>, splitLines: Record<string, CorrelationSplitLine[]>, options:CorrelationChartOptions) => {
    const elements: EChartsOption['graphic'] = []
    const prepareData: Map<string, {
        prevValue: number | null; nextValue: number | null, type: string, color: string
    }> = new Map()

    if (node.prev) {
        const linesPrev = splitLines[node.prev?.value.name] ?? []

        for (const line of linesPrev) {
            prepareData.set(line.name, {
                prevValue: Number(line.value), nextValue: null, type: line.type, color: line.color,
            })
        }
    }

    if (node.next) {
        const linesNext = splitLines[node.next?.value.name] ?? []

        for (const line of linesNext) {
            const temp = prepareData.get(line.name) ?? {nextValue: null}
            temp.nextValue = Number(line.value)
        }
    }

    prepareData.forEach((value, name) => {
        const configLine: typeof elements[number] = {
            name: name,
            id: name,
            type: 'line',
            shape: {
                x1: 0,
                y1: Number(value.prevValue),
                x2: options.tabletGap,
                y2: Number(value.nextValue)
            },
            style: {
                stroke: value.color,
                lineWidth: LINE_WIDTH,
                lineDash: [],
            }

        }
        if (value.type === 'dashed') {
            configLine.style!.lineDash = [5, 5]
        }

        elements.push(
            configLine
        )
    })


    return elements
}