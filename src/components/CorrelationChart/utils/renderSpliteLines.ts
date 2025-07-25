import {CONNECT_LINE} from "../CorrelationChart.consts.ts";
import {convertLinesToElements, generateConnectLineElements} from "../CorrelationChart.utils.ts";
import * as echarts from "echarts/core";
import type {
    CorrelationChartWithInnerOptions,
    CorrelationSplitLine, EChartGraphic,
    GraphicComponentLooseOptionExtended
} from "../CorrelationChart.types.ts";
import type {LinkedListInstance} from "../LinkedList.ts";
import type {RefObject} from "react";
import {updateSplitLine} from "./calculateSplitLine.ts";

const H_LINE = 3

export const renderSplitLines = (chartInstances: RefObject<LinkedListInstance>, options: CorrelationChartWithInnerOptions, splitLines: RefObject<Map<string, CorrelationSplitLine[]>>) => {

    let currentNode = chartInstances.current.head;
    while (currentNode) {
        const instance = currentNode.value.instance
        const nodeName = currentNode.value.name;
        const next = currentNode.next;
        const prev = currentNode.prev;

        let elements = []

        if (nodeName === CONNECT_LINE) {
            elements = generateConnectLineElements(currentNode, splitLines.current, options)
        } else {
            elements = convertLinesToElements(splitLines.current.get(currentNode.value.name) ?? [], instance, options)
        }

        let newPositionY = 0


        // Перетаскиваем разбивки
        instance.setOption({
            graphic: echarts.util.map(elements, function (dataItem, dataIndex) {
                return {
                    ...dataItem,
                    ondrag: echarts.util.curry(function (dataIndex, event) {
                        newPositionY = event.offsetY - (elements[dataIndex] as GraphicComponentLooseOptionExtended<typeof elements[number]>).shape.y2;

                        let offsetY = event.offsetY

                        const currentIndex = Math.floor(dataIndex / 2);

                        let BOTTOM_LIMIT = options.height
                        let TOP_LIMIT = options.gridPaddingTop

                        const nearLines = splitLines.current.get(nodeName) ?? []

                        if (nearLines[currentIndex + 1]) {
                            const calcPositionPixel = instance.convertToPixel({yAxisIndex: 0}, nearLines[currentIndex + 1].value);
                            BOTTOM_LIMIT = Math.min(calcPositionPixel, BOTTOM_LIMIT);
                        }

                        if (nearLines[currentIndex - 1]) {
                            const calcPositionPixel = instance.convertToPixel({yAxisIndex: 0}, nearLines[currentIndex - 1].value) + 2 * H_LINE;
                            TOP_LIMIT = Math.max(calcPositionPixel, TOP_LIMIT);
                        }

                        // Начинаем обновление координат
                        if (BOTTOM_LIMIT < event.offsetY) {
                            const bottom = BOTTOM_LIMIT - H_LINE
                            newPositionY = bottom - (elements[dataIndex] as GraphicComponentLooseOptionExtended<typeof elements[number]>).shape.y2
                            offsetY = bottom
                        } else if (TOP_LIMIT > event.offsetY) {
                            const top = TOP_LIMIT - H_LINE;
                            newPositionY = top - (elements[dataIndex] as GraphicComponentLooseOptionExtended<typeof elements[number]>).shape.y2
                            offsetY = top;
                        }

                        // Изменяем позицию разбивки
                        (elements[dataIndex] as GraphicComponentLooseOptionExtended<typeof elements[number]>).position = [0, newPositionY];
                        // Изменяем позицию подписи разбивки
                        (elements[dataIndex - 1] as GraphicComponentLooseOptionExtended<typeof elements[number]>).top = offsetY - 20;


                        const currentValue = instance.convertFromPixel({yAxisIndex: 0}, offsetY)

                        splitLines.current = updateSplitLine(splitLines.current, nodeName, currentIndex, currentValue)

                        instance.setOption({graphic: {elements}})

                        // Обновляем линию соединения разбивки
                        const nextInstance = next?.value.instance
                        const prevInstance = prev?.value.instance


                        if (nextInstance) {
                            const nextElements = (nextInstance.getOption() as EChartGraphic<typeof elements>).graphic[0].elements ?? [];
                            const nextIndex = Math.floor(dataIndex / 2);

                            (nextElements[nextIndex] as unknown as GraphicComponentLooseOptionExtended<typeof elements[number]>).shape.y1 = offsetY;

                            nextInstance.setOption({graphic: {elements: nextElements}})
                        }

                        if (prevInstance) {
                            const prevElements = (prevInstance.getOption() as EChartGraphic<typeof elements>).graphic[0].elements ?? [];
                            const prevIndex = Math.floor(dataIndex / 2);
                            (prevElements[prevIndex] as unknown as GraphicComponentLooseOptionExtended<typeof elements[number]>).shape.y2 = offsetY;

                            prevInstance.setOption({graphic: {elements: prevElements}})
                        }


                    }, dataIndex)
                }
            })
        })

        currentNode = currentNode.next;
    }
}