export function initializeRef<T, R extends React.MutableRefObject<T | undefined>>(ref: R, value: T) {
    if (!ref.current) ref.current = value;
    return ref;
} 