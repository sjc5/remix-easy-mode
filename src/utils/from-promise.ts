type FromPromise<T extends (...args: any) => any> = Awaited<ReturnType<T>>

export type { FromPromise }
