/**
 * @jest-environment node
 */
import { LOG, CI } from './log';
import type { COLOR_SET, LogOpts } from './log.d';
import { colors } from './colors';
import * as readline from 'readline';
import { COLOR_SETS, LogType } from './log.config';
const { execSync } = require('child_process');
const clearOutput = true; // for debugging purposes

let spyLog: jest.SpyInstance;
let spyColorize: jest.SpyInstance;
describe('test logger', () => {
    it('should format the message correctly', () => {
        const spyOutput = jest.spyOn(LOG, 'output');
        const msg = 'Test LOGGING message';
        const type = LogType.OK;
        LOG.logger(type, msg, {});
        const result = `  ${colors.FgBlack} ${colors.BgGreen}    [${type}]  ${colors.Reset} ${msg}\n`;
        expect(spyOutput).toHaveBeenCalledWith(result);
        spyOutput.mockRestore();
    });
});

const CASES = [
    { test: 'log.ok has green output', fn: LOG.OK, id: 'OK' },
    { test: 'log.fail has red output', fn: LOG.FAIL, id: 'FAIL' },
    { test: 'log.warn has yellow output', fn: LOG.WARN, id: 'WARN' },
    { test: 'log.info has white output', fn: LOG.INFO, id: 'INFO' },
    { test: 'log.default has green output', fn: LOG.DEFAULT, id: 'DEFAULT' },
    { test: 'log.inline has white output', fn: LOG.INLINE, id: 'INLINE' },
    { test: 'log.debug has white output', fn: LOG.DEBUG, id: 'DEBUG' },
];
const SCENARIOS: any = {
    'without newline': {},
    'withnewline=true': { newline: true }, // time intensive
    'withnewline=false': { newline: false }, // time intensive
};
describe('class: LOG', () => {
    it('should do all instance methods', () => {
        const _log = new LOG();
        _log.OK('ok message', { foo: 2 });
        _log.FAIL('fail message');
        _log.WARN('warn message');
        _log.INFO('info message');
        _log.DEFAULT('default message');
        _log.INLINE('inline message');
        _log.DEBUG('debug message');
        const time = expect.any(Number);
        const telemetry = {};
        const EXPECTED = [
            { message: 'ok message', type: 'OK', time, telemetry: { foo: 2 } },
            { message: 'fail message', type: 'FAIL', time, telemetry },
            { message: 'warn message', type: 'WARN', time, telemetry },
            { message: 'info message', type: 'INFO', time, telemetry },
            { message: 'default message', type: 'DEFAULT', time, telemetry },
            { message: 'inline message', type: 'INLINE', time, telemetry },
            { message: 'debug message', type: 'DEBUG', time, telemetry },
        ];
        const EXPECTED_SHORT = EXPECTED.map((item) => ({
            message: item.message,
            type: item.type,
        }));
        expect(_log.items.length).toBe(EXPECTED.length);
        const items = _log.items;
        expect(items).toEqual(EXPECTED);
        expect(_log.getItems()).toEqual(EXPECTED_SHORT);
    });
});
describe('log library', () => {
    beforeEach(() => {
        spyLog = jest.spyOn(LOG, 'logger');
        spyColorize = jest.spyOn(LOG, 'colorize');
    });
    afterEach(() => {
        jest.clearAllMocks();
        spyLog.mockRestore();
        spyColorize.mockRestore();
        // clear output if tests successful
        if (clearOutput) readline.cursorTo(process.stdout, 0, 0);
    });

    const getTypeFromStatus = (status: string): string => {
        const item: COLOR_SET = COLOR_SETS[status as keyof typeof COLOR_SETS];
        const type = item.id;
        return type as string;
    };

    const SCENARIO_KEYS = Object.keys(SCENARIOS);
    SCENARIO_KEYS.forEach((KEY: string) => {
        const SCENARIO = SCENARIOS[KEY];
        const hasNewline = SCENARIO.hasOwnProperty('newline');
        describe.each(CASES.map((CASE) => [CASE]))(
            `test logs ${KEY}`,
            (CASE) => {
                const type = getTypeFromStatus(CASE.id);
                const colorSet: COLOR_SET =
                    COLOR_SETS[type as keyof typeof COLOR_SETS];
                const id = CASE.id;
                const isEmpty = id === 'DEFAULT' || id === 'INLINE';
                const status = isEmpty ? '' : `[${CASE.id}]`;
                const EXPECTED = [status, colorSet.bg, colorSet.fg];
                it(`${CASE.test}`, () => {
                    const opts: LogOpts = {};
                    if (hasNewline) {
                        opts['newline'] = SCENARIO.hasOwnProperty('newline');
                    }
                    CASE.fn('foobar', opts);
                    expect(spyLog).toHaveBeenCalledWith(type, 'foobar', opts);
                    expect(spyColorize).toHaveBeenCalledWith(...EXPECTED);
                });
                it(`${CASE.test} with icon`, () => {
                    const hasNewline = SCENARIO.hasOwnProperty('newline');
                    const opts = {
                        icon: 'xxx',
                        newline: hasNewline,
                    };
                    CASE.fn('foobar', opts);
                    expect(spyLog).toHaveBeenCalledWith(type, 'foobar', opts);
                    expect(spyColorize).toHaveBeenCalledWith(...EXPECTED);
                });
                afterEach(() => {
                    if (clearOutput && !hasNewline)
                        readline.cursorTo(process.stdout, 0, 0);
                    if (clearOutput && hasNewline) execSync('clear');
                });
            }
        );
    });
});
describe('getCallerInfo()', () => {
    const FILE_REGEX = /@.*log\.spec\.ts:\d+/;
    describe('standard cases', () => {
        describe('basics', () => {
            it('should return the correct caller info', () => {
                const ci = CI();
                expect(ci).toEqual(expect.stringMatching(FILE_REGEX));
                expect(ci).toEqual(expect.stringContaining('anonymous()@'));
            });
            it('should return the correct caller info with classHint', () => {
                const ci = CI('FOO');
                expect(ci).toEqual(expect.stringMatching(FILE_REGEX));
                expect(ci).toEqual(expect.stringContaining('FOO.anonymous()@'));
            });
        });
        describe('with function context', () => {
            it('should return the correct caller info from fakeFn()', () => {
                const logSpy = jest.spyOn(LOG, 'INFO');
                const fakeFn = () => {
                    LOG.INFO(`[${CI()}] This is a test log message.`);
                };
                fakeFn();
                const ci = logSpy.mock.calls[0][0];
                expect(ci).toEqual(expect.stringMatching(FILE_REGEX));
                expect(ci).toEqual(expect.stringContaining('fakeFn()@'));
                logSpy.mockRestore();
            });
            it('should return the correct caller info from FakeClass fn()', () => {
                const logSpy = jest.spyOn(LOG, 'INFO');
                class FAKE {
                    static fakeFn() {
                        LOG.INFO(`[${CI('FAKE')}] test log message.`);
                    }
                }
                FAKE.fakeFn();
                const ci = logSpy.mock.calls[0][0];
                expect(ci).toEqual(expect.stringMatching(FILE_REGEX));
                expect(ci).toEqual(expect.stringContaining('FAKE.fakeFn()@'));
                logSpy.mockRestore();
            });
        });
    });
    describe('edge cases', () => {
        it('returns unknown if stack is missing', () => {
            const Original = Error;
            global.Error = class extends Original {
                constructor() {
                    super();
                    this.stack = undefined;
                }
            } as any;
            expect(CI()).toBe('(unknown)');
            global.Error = Original;
        });
        it('handles stack without function name', () => {
            const fakeStack = `Error
                    // new line needed for test
                    at /home/user/project/src/utils/file.ts:123:45`;
            const FAKE_ERROR = { stack: fakeStack, name: 'Error', message: '' };
            const spy = jest.spyOn(global, 'Error').mockImplementation(
                // satisfy eslint
                () => ({ ...FAKE_ERROR }) as unknown as Error
            );
            const result = CI();
            expect(result).toMatch(/anonymous\(\)@.*file\.ts:123/);
            spy.mockRestore();
        });

        it('returns unknown if no match at all', () => {
            const fakeStack = `Error\n    random garbage`;
            const FAKE_ERROR = { stack: fakeStack, name: 'Error', message: '' };
            const spy = jest.spyOn(global, 'Error').mockImplementation(
                // satisfy eslint
                () => ({ ...FAKE_ERROR }) as unknown as Error
            );
            expect(CI()).toBe('(unknown)');
            spy.mockRestore();
        });
    });
});