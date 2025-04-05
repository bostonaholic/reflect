let isDebugEnabled: boolean | undefined;

// TODO: Remove after `--debug` deprecation period
export function setDebug(debug?: boolean): void {
    console.log('Setting debug to', debug);
    isDebugEnabled = debug;
}

export function isDebug(): boolean {
    if (isDebugEnabled === undefined) {
        isDebugEnabled = process.env.DEBUG === '1';
    }
    return isDebugEnabled;
}