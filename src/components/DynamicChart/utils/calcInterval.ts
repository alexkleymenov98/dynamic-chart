// todo: напоминаю о типах number
export const calcInterval = (xAxisDiffInMonth: number, setting: Record<number, number>) => {
    const months = Object.keys(setting).map((v) => Number(v) * 12).sort((a, b) => a < b ? 1 : -1)

    for (let i = 0; i < months.length; i++) {
        const countMonths = months[i]
        if (xAxisDiffInMonth >= countMonths) {
            const year = countMonths / 12

            return setting[year]
        }
    }

    return 0
}
