export function ifNotUndefined<T>(value: T | undefined): T | undefined {
    return value !== 'undefined' ? value : undefined;
}

export function getAsDate(dateStr: string | undefined): Date | undefined {
    return ifNotUndefined(dateStr) ? new Date(dateStr) : undefined;
}

export function getAsString(value: string | undefined): string | undefined {
    return ifNotUndefined(value) ? String(value) : undefined;
}

export function getAsBoolean(value: string | undefined): boolean | undefined {
    return ifNotUndefined(value) ? value === 'true' : undefined;
}

export function getAsNumber(value: string | undefined): number | undefined {
    return ifNotUndefined(value) ? Number(value) : undefined;
}

export function getAsArray(value: string | undefined): string[] | undefined {
    return getAsString(value)?.split(',');
}

export function getAsNumberArray(value: string | undefined): number[] | undefined {
    return getAsArray(value)?.map(Number).filter(val => !isNaN(val));
}
