export const calcInterval = (diff: number, setting:Record<number, number>)=>{
    const months = Object.keys(setting).map((v)=>Number(v) * 12).sort((a,b)=>a < b ? 1: -1)

    let interval = 0

    for(let i = 0; i < months.length; i++){
        const key = months[i]
        if(diff >= key){
            const year = key / 12
            interval = setting[year]
            break
        }
    }

    return interval
}