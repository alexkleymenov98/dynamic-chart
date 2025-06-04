export const getIsRight = (index: number) => {
    return index === 1 || index === 2
}


export const getForTopAxisPointer = (index: number, len: number): 'top' | 'bottom' => {
    const conditionForLessTwoAxisY = len <= 2
    const conditionForThreeAxisY = len === 3 && index === 0
    const conditionForThreeAndMoreAxisY = index === 1 || index === 3

    if (conditionForLessTwoAxisY || conditionForThreeAxisY || conditionForThreeAndMoreAxisY) {
        return 'top'
    }

    return 'bottom'
}
