import {CONNECT_LINE} from "../CorrelationChart.consts.ts";
import {convertLinesToElements, generateConnectLineElements} from "../CorrelationChart.utils.ts";
import * as echarts from "echarts/core";
import type {
    CorrelationChartOptions,
    CorrelationSplitLine, EChartGraphic,
    GraphicComponentLooseOptionExtended
} from "../CorrelationChart.types.ts";
import type {LinkedListInstance} from "../LinkedList.ts";
import type {RefObject} from "react";

export const renderSplitLines = (chartInstances: RefObject<LinkedListInstance>, splitLines: Record<string, CorrelationSplitLine[]>, options: CorrelationChartOptions) => {

    let currentNode = chartInstances.current.head;
    while (currentNode) {
        const instance = currentNode.value.instance
        const next = currentNode.next;
        const prev = currentNode.prev;

        let elements = []

        if (currentNode.value.name === CONNECT_LINE) {
            elements = generateConnectLineElements(currentNode, splitLines, options)
        } else {
            elements = convertLinesToElements(splitLines?.[currentNode.value.name], instance)
        }

        let newPositionY = 0


        // Перетаскиваем разбивки
        instance.setOption({
            graphic: echarts.util.map(elements, function (dataItem, dataIndex) {
                return {
                    ...dataItem,
                    ondrag: echarts.util.curry(function (dataIndex, event) {
                        newPositionY = event.offsetY - (elements[dataIndex] as GraphicComponentLooseOptionExtended<typeof elements[number]>).shape.y2;


                        (elements[dataIndex] as GraphicComponentLooseOptionExtended<typeof elements[number]>).position = [0, newPositionY];
                        (elements[dataIndex - 1] as GraphicComponentLooseOptionExtended<typeof elements[number]>).top = event.offsetY - 20;

                        instance.setOption({graphic: {elements}})

                        // Обновляем линию соединения разбивки
                        const nextInstance = next?.value.instance
                        const prevInstance = prev?.value.instance


                        if (nextInstance) {
                            const nextElements = (nextInstance.getOption() as EChartGraphic<typeof elements>).graphic[0].elements ?? [];
                            const nextIndex = Math.floor(dataIndex / 2);

                            (nextElements[nextIndex] as unknown as GraphicComponentLooseOptionExtended<typeof elements[number]>).shape.y1 = event.offsetY;

                            nextInstance.setOption({graphic: {elements: nextElements}})
                        }

                        if (prevInstance) {
                            const prevElements = (prevInstance.getOption() as EChartGraphic<typeof elements>).graphic[0].elements ?? [];
                            const prevIndex = Math.floor(dataIndex / 2);
                            (prevElements[prevIndex] as unknown as GraphicComponentLooseOptionExtended<typeof elements[number]>).shape.y2 = event.offsetY;

                            prevInstance.setOption({graphic: {elements: prevElements}})
                        }


                    }, dataIndex)
                }
            })
        })

        currentNode = currentNode.next;
    }
}