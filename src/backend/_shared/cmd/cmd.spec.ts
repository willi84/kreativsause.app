/**
 * @jest-environment node
 */
import * as cmd from './cmd';
import { LOG } from '../log/log';

describe('cmd', () => {
    it('should return a valid command', () => {
        const command = 'echo "Hello, World!"';
        expect(cmd.command(command)).toEqual('Hello, World!\n');
    });
    it('should return a valid command', () => {
        const command = 'pwd .';
        const result = cmd.command(command);
        const pwd = process.cwd();
        expect(result).toEqual(pwd + '\n');
    });
    it('should return an empty output when error occurs', () => {
        const logSpy = jest.spyOn(LOG, 'FAIL');
        const command = 'abcdefghijklmnopqrstuvwxyz';
        expect(cmd.command(command, true, true)).toEqual('');
        expect(logSpy).toHaveBeenCalledWith(
            expect.stringContaining('Command failed')
        );
        logSpy.mockRestore();
    });
    it('should return a valid command with error', () => {
        const command = 'echo "Hello, World!" && exit 1';
        const result = cmd.command(command, true, false);
        expect(result).toEqual('');
    });
});