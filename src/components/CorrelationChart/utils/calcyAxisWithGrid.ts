export const calcYAxisWithGrid = (yIndex: number, gridIndex: number): number => {
    const COUNT = 2

    const step = COUNT * gridIndex;

    return yIndex + step
}