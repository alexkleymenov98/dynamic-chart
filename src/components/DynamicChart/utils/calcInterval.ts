import type {TInternalSetting} from "../types.ts";

export const calcInterval = (xAxisDiffInMonth: number, setting: TInternalSetting) => {
    const countMonthForYear = 12
    const months = Object.keys(setting)
        .map((year) => Number(year) * countMonthForYear)
        .sort((a, b) => a < b ? 1 : -1)

    for (let i = 0; i < months.length; i++) {
        const countMonths = months[i]
        if (xAxisDiffInMonth >= countMonths) {
            const year = countMonths / countMonthForYear

            return setting[year]
        }
    }

    return 0
}
