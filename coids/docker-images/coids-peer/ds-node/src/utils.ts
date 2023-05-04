const red = '\x1b[31m%s\x1b[0m'
const green = '\x1b[32m%s\x1b[0m'
const yellow = '\x1b[33m%s\x1b[0m'
const blue = '\x1b[34m%s\x1b[0m'

export function println(message: string): void {
    console.log(message);
}

export function infoln(message: string): void {
    console.log(blue, message);
}

export function errorln(message: string): void {
    console.log(red, message);
}

export function successln(message: string): void {
    console.log(green, message);
}

export function warnln(message: string): void {
    console.log(yellow, message);
}

export function fatalln(message: string): void {
    console.log(red, message);
    process.exit(1);
}

/**
 * envOrDefault() will return the value of an environment variable, or a default value if the variable is undefined.
 */
export function envOrDefault(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
}

