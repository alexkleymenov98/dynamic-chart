import type {DoubleListNode, ListNodeInstances} from "./CorrelationChart.types.ts";
import type {EChartsType} from "echarts/core";
import {CONNECT_LINE} from "./CorrelationChart.consts.ts";

export class ListNode<T> {
    prev: DoubleListNode<T> | null
    value: T;
    next: DoubleListNode<T> | null

    constructor(value: T, next: ListNode<T> | null = null, prev: ListNode<T> | null = null) {
        this.value = value;
        this.next = next
        this.prev = prev
    }
}

class DoubleLinkedList<T> {
    head: ListNode<T> | null = null
    tail: ListNode<T> | null = null

    append(value: T) {
        const newNode: ListNode<T> = {
            value,
            next: null,
            prev: this.tail,  // Новый узел ссылается на старый хвост
        };

        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail!.next = newNode;  // Старый хвост ссылается на новый узел
            this.tail = newNode;        // Новый узел становится хвостом
        }
    }

    // Поиск элемента
    find(value: T): ListNode<T> | null {
        let currentNode = this.head;
        while (currentNode) {
            if (currentNode.value === value) {
                return currentNode;
            }
            currentNode = currentNode.next;
        }
        return null;
    }

    print() {
        let currentNode = this.head;
        while (currentNode) {
            console.log(currentNode, 'node')
            currentNode = currentNode.next;
        }

    }
}

export class LinkedListInstance extends DoubleLinkedList<ListNodeInstances> {
    getInstance(name: string) {
        let currentNode = this.head;

        while (currentNode) {
            if (currentNode.value.name === name) {
                return currentNode.value.instance;
            }
            currentNode = currentNode.next;
        }
        return null;
    }

    forEach(fn: (instance: EChartsType) => void) {
        let currentNode = this.head;

        while (currentNode) {
            if(!currentNode.value.name.includes(CONNECT_LINE)){
                fn(currentNode.value.instance)
            }

            currentNode = currentNode.next;
        }
    }
}

