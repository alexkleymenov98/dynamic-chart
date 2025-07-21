import {CONNECT_LINE} from "../CorrelationChart.consts.ts";
import {convertLinesToElements, generateConnectLineElements} from "../CorrelationChart.utils.ts";
import * as echarts from "echarts/core";
import type {CorrelationChartOptions, CorrelationSplitLine} from "../CorrelationChart.types.ts";
import type {LinkedListInstance} from "../LinkedList.ts";
import type {RefObject} from "react";

export const renderSpliteLines = (chartInstances: RefObject<LinkedListInstance>, splitLines: Record<string, CorrelationSplitLine[]>, options: CorrelationChartOptions)=>{

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
                        newPositionY = event.offsetY - elements[dataIndex].shape.y2


                        elements[dataIndex].position = [0, newPositionY]
                        elements[dataIndex - 1].top = event.offsetY - 20

                        instance.setOption({graphic: {elements}})

                        // Обновляем линию соединения разбивки
                        const nextInstance = next?.value.instance
                        const prevInstance = prev?.value.instance


                        if (nextInstance) {
                            const nextElements = nextInstance.getOption().graphic[0].elements ?? []
                            const nextIndex = Math.floor(dataIndex / 2)
                            nextElements[nextIndex].shape.y1 = event.offsetY

                            nextInstance.setOption({graphic: {elements: nextElements}})
                        }

                        if (prevInstance) {
                            const prevElements = prevInstance.getOption().graphic[0].elements ?? []
                            const prevIndex = Math.floor(dataIndex / 2)
                            prevElements[prevIndex].shape.y2 = event.offsetY

                            prevInstance.setOption({graphic: {elements: prevElements}})
                        }

                    }, dataIndex)
                }
            })
        })

        currentNode = currentNode.next;
    }
}