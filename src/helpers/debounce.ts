type Function = (...args: any[]) => void;

interface Return<T extends Function> {
    debounced: T;
    clear: () => void | null | number;
}

export function debounce<T extends Function>(
    func: T,
    delay: number = 300,
): Return<T> {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastArgs: Parameters<T> | null = null;

    const clear = () => timeoutId && clearTimeout(timeoutId);

    const debounced = function (...args: Parameters<T>) {
        clear();

        lastArgs = args;

        timeoutId = setTimeout(() => {
            timeoutId = null;

            if (lastArgs) {
                func(...lastArgs);

                lastArgs = null;
            }
        }, delay);
    } as T;

    return { debounced, clear };
}
