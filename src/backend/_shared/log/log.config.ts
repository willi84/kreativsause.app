import { colors } from './colors';
import type { COLOR_SET_ITEMS } from './log.d';

export enum LogType {
    OK = 'OK',
    FAIL = 'FAIL',
    WARN = 'WARN',
    NEWLINE = 'NEWLINE',
    INFO = 'INFO',
    DEFAULT = 'DEFAULT',
    INLINE = 'INLINE',
    DEBUG = 'DEBUG',
}

export const COLOR_SETS: COLOR_SET_ITEMS = {
    [LogType.OK]: { id: 'OK', fg: colors.FgBlack, bg: colors.BgGreen },
    [LogType.FAIL]: { id: 'FAIL', fg: colors.FgWhite, bg: colors.BgRed },
    [LogType.WARN]: { id: 'WARN', fg: colors.FgWhite, bg: colors.BgYellow },
    [LogType.INFO]: { id: 'INFO', fg: colors.FgBlack, bg: colors.BgWhite },
    [LogType.DEFAULT]: {
        id: 'DEFAULT',
        fg: colors.FgWhite,
        bg: colors.BgBlack,
    },
    [LogType.INLINE]: { id: 'INLINE', fg: colors.FgWhite, bg: colors.BgBlack },
    [LogType.DEBUG]: { id: 'DEBUG', fg: colors.FgBlack, bg: colors.BgWhite },
    [LogType.NEWLINE]: { id: 'NEWLINE', fg: colors.FgWhite, bg: colors.BgBlack },
};