import { colors } from './colors';
import * as path from 'path';
import type { COLOR_SET, LogItem, LogOpts } from './log.d';
import { COLOR_SETS, LogType } from './log.config';

// TODO: move to other file
// const isMicrosoft = os.release().toLocaleLowerCase().includes('microsoft');
// const hasLinuxPlattform = process.platform.includes('linux');
// const isVSCode = (process.env.TERM_PROGRAM && process.env.TERM_PROGRAM.includes('vscode'));
// let noEmojis = isMicrosoft && hasLinuxPlattform && (!isVSCode);
// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color

const getColorSet = (type: LogType): COLOR_SET => {
    const resolvedType = type as keyof typeof COLOR_SETS;
    const colorSet: COLOR_SET = COLOR_SETS[resolvedType] as COLOR_SET;
    return colorSet;
};

const makeLogger = (type: LogType) => (msg: string, opts?: LogOpts) => {
    LOG.logger(type, msg, opts || { icon: '', newline: false });
};

export const colorize = (msg: string, bg: string, fg: string, pad = '  ') => {
    const colorSet = `${pad}${fg} ${bg}${pad}`;
    const result = `${colorSet}${pad}${msg}${pad}${colors.Reset} `;
    return msg !== '' ? `${result}` : '';
};

export class LOG {
    items: LogItem[];
    constructor() {
        this.items = [];
    }
    makeLogger = (type: LogType) => (msg: string, telemetry?: any) => {
        // LOG.logger(type, msg, opts || { icon: '', newline: false });
        this.doLog(type, msg, this.items, telemetry);
    };

    doLog(type: LogType, msg: string, items: LogItem[], telemetry: any = {}) {
        const time = new Date().getTime();
        const logItem: LogItem = {
            message: msg,
            type,
            time,
            telemetry,
        };
        items.push(logItem);
    }
    getItems() {
        return this.items.map((item: LogItem) => {
            return {
                message: item.message,
                type: item.type,
            };
        });
    }
    static colorize = colorize;
    static output = (msg: string) => {
        process.stdout.write(`${msg}`);
    };
    static logger(type: LogType, msg: string, opts?: LogOpts) {
        const color = getColorSet(type);
        const icon = opts?.icon || '';
        const isInline = type === LogType.INLINE || type === LogType.DEFAULT;
        // const needSpaces = type.length < 4;
        // const spaces = needSpaces ? ' '.repeat((4 - type.length) / 2) : '';
        const txt = isInline ? '' : `[${color.id}]`;
        // const txt = isInline ? '' : `[${spaces}${color.id}${spaces}]`;
        const status = LOG.colorize(txt, color.bg, color.fg);
        const isNewline = type !== LogType.INLINE;
        LOG.output(`${status}${icon}${msg}${isNewline ? '\n' : ''}`);
    }
    // static methods
    static OK = makeLogger(LogType.OK);
    static FAIL = makeLogger(LogType.FAIL);
    static WARN = makeLogger(LogType.WARN);
    static INFO = makeLogger(LogType.INFO);
    static DEFAULT = makeLogger(LogType.DEFAULT);
    static INLINE = makeLogger(LogType.INLINE);
    static DEBUG = makeLogger(LogType.DEBUG);
    static NEWLINE = makeLogger(LogType.NEWLINE);

    // instance methods
    OK = this.makeLogger(LogType.OK);
    FAIL = this.makeLogger(LogType.FAIL);
    WARN = this.makeLogger(LogType.WARN);
    INFO = this.makeLogger(LogType.INFO);
    DEFAULT = this.makeLogger(LogType.DEFAULT);
    INLINE = this.makeLogger(LogType.INLINE);
    DEBUG = this.makeLogger(LogType.DEBUG);
}
export const getCallerInfo = (
    classHint?: string,
    depth: number = 2
): string => {
    const stack = new Error().stack;
    if (!stack) return '(unknown)';

    const lines = stack.split('\n');
    const callerLine = lines[depth] || '';

    let match = callerLine.match(/at\s+(.*?)\s+\((.+):(\d+):(\d+)\)/);
    if (!match) {
        match = callerLine.match(/\s*at\s+(.*):(\d+):(\d+)/);
        if (!match) return '(unknown)';
        const [, file, line] = match;
        const relFile = path.relative(process.cwd(), file);
        return `anonymous()@${relFile}:${line}`;
    }

    const [, rawFn, file, line] = match;
    const relFile = path.relative(process.cwd(), file);

    const fn = rawFn
        .replace(/^Object\./, '')
        .replace(/^Function\./, '')
        .replace(/<anonymous>/, 'anonymous');

    const finalFn = classHint ? `${classHint}.${fn}` : fn;

    return `${finalFn}()@${relFile}:${line}`;
};
export const CI = getCallerInfo;