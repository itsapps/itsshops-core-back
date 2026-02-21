
export type WithOptionalTitle<T> = Omit<T, 'title'> & { title?: string };
