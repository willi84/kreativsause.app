/**
 * 🧪 Testing module FS
 * @module backend/_shared/FS
 * @version 0.0.1
 * @date 2026-09-18
 * @license MIT
 * @author Robert Willemelis <github.com/willi84>
 */

import { FS, Status } from './fs';
import * as fs from 'fs';
import * as mock from 'mock-fs';
import { LOG } from '../log/log';
import type { FileItems } from './fs.d';
// let PATH = `${BASE}/tmp/foo`;

const checkChanges = (originalFileContent: string | null, file: string) => {
    const exists = fs.existsSync(file);
    if (!originalFileContent && exists) {
        return { status: Status.CREATED, file };
    } else if (originalFileContent && exists) {
        const currentFileContent = fs.readFileSync(file, 'utf8');
        if (currentFileContent === originalFileContent) {
            return { status: Status.NO_CHANGES, file };
        } else {
            if (currentFileContent.includes(originalFileContent)) {
                return { status: Status.EXTENDED, file };
            } else {
                return { status: Status.OVERWRITTEN, file };
            }
        }
    } else if (originalFileContent && !exists) {
        return { status: Status.REMOVED, file };
    } else {
        return { status: Status.NOT_EXISTS, file };
    }
};
const getFileContent = (file: string) => {
    return fs.readFileSync(`${file}`).toString();
};
const isExisting = (file: string) => {
    return fs.existsSync(file);
};

describe('CLASS: FS', () => {
    beforeEach(() => {
        mock.restore();
        mock({
            tmp: {
                'file.txt': 'xx',
                'file.json': '{ "xxx": 2}',
                'invalidKey.json': `{
                    // foobar
                    xxx: 2, "yyy": "foobar", bla: "blubber", holsten: { "bla": "kosten"}
                }`,
            },
            tmpEmpty: {},
        });
    });
    afterEach(() => {
        mock.restore();
        jest.clearAllMocks();
        // readline.cursorTo(process.stdout, 0);
    });
    describe('✅ exists()', () => {
        const FN = FS.exists;
        describe('with normal path', () => {
            it('should return true for existing file or folder', () => {
                expect(FN('tmp')).toEqual(true);
                expect(FN('tmp/file.txt')).toEqual(true);
            });
            it('should return false for non-existing file', () => {
                expect(FN('tmp/notexists')).toEqual(false);
                expect(FN('tmp/notexists.txt')).toEqual(false);
            });
        });
        describe('with relative path', () => {
            it('should return true for existing file/folder with relative path', () => {
                expect(FN('./tmp')).toEqual(true);
                expect(FN('./tmp/file.txt')).toEqual(true);
            });
            it('should return false for non-existing file/folder with relative path', () => {
                expect(FN('./tmp/notexists')).toEqual(false);
                expect(FN('./tmp/notexists.txt')).toEqual(false);
            });
        });
        describe('with absolute path', () => {
            const CWD = process.cwd();
            it('should return true for existing file/folder with absolute path', () => {
                expect(FN(`${CWD}/tmp`)).toEqual(true);
                expect(FN(`${CWD}/tmp/file.txt`)).toEqual(true);
            });
            it('should return false for non-existing file/folder with absolute path', () => {
                expect(FN(`${CWD}/tmp/notexists`)).toEqual(false);
                expect(FN(`${CWD}/tmp/notexists.txt`)).toEqual(false);
            });
        });
    });
    describe('🚧 getFileName()', () => {
        const FN = FS.getFileName;
        it('should return the file name from a path', () => {
            expect(FN('file.txt')).toEqual('file.txt');
            expect(FN('')).toEqual('');
            expect(FN('tmp/foo/bar/file.txt')).toEqual('file.txt');
            expect(FN('tmp/foo/bar/file')).toEqual(''); // TODO: files without extension
        });
    });
    describe('✅ createFolder()', () => {
        const TEST_FOLDER: string = 'testFolder';
        const FN = FS.createFolder;
        it('creation of existing a folder', () => {
            mock({ testFolder: {} });
            expect(isExisting(TEST_FOLDER)).toEqual(true);
            FN(TEST_FOLDER);
            expect(isExisting(TEST_FOLDER)).toEqual(true);
        });
        it('creation of a new folder', () => {
            expect(isExisting(TEST_FOLDER)).toEqual(false);
            FN(TEST_FOLDER);
            expect(isExisting(TEST_FOLDER)).toEqual(true);
        });
    });
    describe('✅ removeFolder()', () => {
        const TEST_FOLDER: string = 'testFolder';
        const FN = FS.removeFolder;
        it('removal of an empty folder', () => {
            mock({ testFolder: {} });
            expect(isExisting(TEST_FOLDER)).toEqual(true);
            FN(TEST_FOLDER);
            expect(isExisting(TEST_FOLDER)).toEqual(false);
        });
        it('removal of a not empty folder without recursive', () => {
            mock({
                testFolder: {
                    'text.md': 'var',
                },
            });
            expect(isExisting(TEST_FOLDER)).toEqual(true);
            FN(TEST_FOLDER);
            expect(isExisting(TEST_FOLDER)).toEqual(false);
        });
        it('removal of a non existing folder', () => {
            const NON_EXISTING_FOLDER = 'notexisting';
            expect(isExisting(NON_EXISTING_FOLDER)).toEqual(false);
            FN(NON_EXISTING_FOLDER);
            expect(isExisting(NON_EXISTING_FOLDER)).toEqual(false);
        });
        it('removal of a not empty folder with recursive', () => {
            mock({
                testFolder: {
                    'text.md': 'var',
                },
            });
            expect(isExisting(TEST_FOLDER)).toEqual(true);
            FN(TEST_FOLDER);
            expect(isExisting(TEST_FOLDER)).toEqual(false);
        });
    });
    describe('✅ getFolder()', () => {
        const TEST_FOLDER: string = 'testFolder';
        const FN = FS.getFolder;
        it('get folder of an existing file', () => {
            mock({ testFolder: { 'text.md': 'var' } });
            expect(isExisting(TEST_FOLDER)).toEqual(true);
            const folder = FN(`${TEST_FOLDER}/text.md`);
            expect(folder).toEqual(TEST_FOLDER);
        });
        it('get folder of an existing folder', () => {
            const EXISTING_FOLDER = 'tmp';
            expect(isExisting(EXISTING_FOLDER)).toEqual(true);
            const folder = FN(EXISTING_FOLDER);
            expect(folder).toEqual(EXISTING_FOLDER);
        });
        it('get folder of a non existing file', () => {
            const NON_EXISTING_FILE = 'notexisting/text.md';
            expect(isExisting(NON_EXISTING_FILE)).toEqual(false);
            const folder = FN(NON_EXISTING_FILE);
            expect(folder).toEqual('notexisting');
        });
        it('get folder of an empty path', () => {
            const EMPTY_PATH = '';
            const folder = FN(EMPTY_PATH);
            expect(folder).toEqual('');
        });
    });
    describe('✅ getFirstFolder()', () => {
        const FN = FS.getFirstFolder;
        it('should return the first folder of a file path', () => {
            const filePath = 'tmp/foo/bar/file.txt';
            const firstFolder = FN(filePath);
            expect(firstFolder).toEqual('tmp');
        });
        it('should return the first folder of a folder path', () => {
            const folderPath = 'tmp/foo/bar/';
            const firstFolder = FN(folderPath);
            expect(firstFolder).toEqual('tmp');
        });
        it('should return an empty string for an empty path', () => {
            const emptyPath = '';
            const firstFolder = FN(emptyPath);
            expect(firstFolder).toEqual('');
        });
    });
    describe('✅ moveFolder()', () => {
        const OLD_FOLDER: string = 'oldFolder';
        const NEW_FOLDER: string = 'newFolder';
        const FN = FS.moveFolder;
        beforeEach(() => {
            mock({ oldFolder: { 'text.md': 'var' } });
        });
        it('should move an existing folder to a new location', () => {
            expect(isExisting(OLD_FOLDER)).toEqual(true);
            FN(OLD_FOLDER, NEW_FOLDER);
            expect(isExisting(OLD_FOLDER)).toEqual(false);
            expect(isExisting(NEW_FOLDER)).toEqual(true);
        });
        it('should not throw an error if the old folder does not exist', () => {
            const NON_EXISTING_FOLDER = 'notexisting';
            expect(isExisting(NON_EXISTING_FOLDER)).toEqual(false);
            FN(NON_EXISTING_FOLDER, NEW_FOLDER);
            expect(isExisting(NON_EXISTING_FOLDER)).toEqual(false);
            expect(isExisting(NEW_FOLDER)).toEqual(false);
        });
    });
    describe('✅ readFile()', () => {
        const FN = FS.readFile;
        it('should read a file with utf8 encoding', () => {
            const content = FN('tmp/file.txt');
            expect(content).toEqual('xx');
        });
        it('should read a JSON file and parse it', () => {
            const content = FN('tmp/file.json');
            expect(content).toEqual('{ "xxx": 2}');
        });
        xit('should read a file with invalid JSON key and parse it', () => {
            const content = FN('tmp/invalidKey.json');
            const EXPECTED = {
                bla: 'blubber',
                holsten: { bla: 'kosten' },
                xxx: 2,
                yyy: 'foobar',
            };
            expect(content).toEqual(JSON.stringify(EXPECTED));
        });
        it('should return an empty string for a non-existing file', () => {
            const spyLog = jest.spyOn(LOG, 'FAIL');
            const content = FN('tmp/notexists.txt');
            expect(content).toEqual(undefined);
            expect(spyLog).toHaveBeenCalledWith(
                expect.stringContaining('FS.readFile()')
            );
            spyLog.mockRestore();
        });
    });
    describe('🚧 writeFile', () => {
        const FILE = `tmp/CREATE_FILE.txt`;
        let currentFileContent: string | any = null;
        const FN = FS.writeFile;
        beforeEach(() => {
            currentFileContent = FS.exists(FILE) ? FS.readFile(FILE) : null;
        });
        afterEach(() => {
            currentFileContent = null;
        });
        it('create file', () => {
            FN(`${FILE}`, 'xxx');
            const result = checkChanges(currentFileContent, FILE);
            expect(result.status).toEqual(Status.CREATED);
            expect(fs.readFileSync(`${FILE}`).toString()).toEqual('xxx');
        });
        it('create file in new directory', () => {
            mock({});
            FN(`${FILE}`, 'xxx');
            const result = checkChanges(currentFileContent, FILE);
            expect(result.status).toEqual(Status.CREATED);
            expect(fs.readFileSync(`${FILE}`).toString()).toEqual('xxx');
        });
        it('create file in new directory', () => {
            const NEW_FILE = `tmp/NEW_DIR/CREATE_FILE.txt`;
            FN(`${NEW_FILE}`, 'xxx', 'replace', false);
            const result = checkChanges(currentFileContent, NEW_FILE);
            expect(result.status).toEqual(Status.NOT_EXISTS);
            expect(FS.readFile(`${NEW_FILE}`)).toEqual(undefined);
        });
        it('create file with stringified json', () => {
            FN(`${FILE}`, { xxx: 2 });
            const result = checkChanges(currentFileContent, FILE);
            expect(result.status).toEqual(Status.CREATED);
            expect(FS.readFile(`${FILE}`)).toEqual('{\n    "xxx": 2\n}');
        });
        it('replace existing file content', () => {
            FN(`${FILE}`, 'xxx', 'replace', false);
            const result = checkChanges(currentFileContent, FILE);
            expect(result.status).toEqual(Status.CREATED);
            expect(FS.readFile(`${FILE}`)).toEqual('xxx');
        });
        it('overwrite file', () => {
            FN(`${FILE}`, 'xxx');
            currentFileContent = getFileContent(FILE);
            expect(currentFileContent).toEqual('xxx');

            FN(`${FILE}`, 'yyy');
            const result = checkChanges(currentFileContent, FILE);
            expect(result.status).toEqual(Status.OVERWRITTEN);
            expect(FS.readFile(`${FILE}`)).toEqual('yyy');
        });
        it('extend file', () => {
            FN(`${FILE}`, 'xxx');
            currentFileContent = getFileContent(FILE);
            expect(currentFileContent).toEqual('xxx');

            FN(`${FILE}`, 'yyy', 'attach');
            const result = checkChanges(currentFileContent, FILE);
            expect(result.status).toEqual(Status.EXTENDED);
            expect(fs.readFileSync(`${FILE}`).toString()).toEqual('xxxyyy');
        });
        xit('errors', () => {});
    });

    describe('✅ removeFile()', () => {
        const FILE = `tmp/CREATE_FILE.txt`;
        const FN = FS.removeFile;
        beforeEach(() => {
            mock({ tmp: { 'CREATE_FILE.txt': 'xx' } });
        });
        afterEach(() => {
            mock.restore();
        });
        it('should remove an existing file', () => {
            expect(isExisting(FILE)).toEqual(true);
            FN(FILE);
            expect(isExisting(FILE)).toEqual(false);
        });
        it('should not throw an error if the file does not exist', () => {
            const NON_EXISTING_FILE = 'tmp/notexists.txt';
            expect(isExisting(NON_EXISTING_FILE)).toEqual(false);
            FN(NON_EXISTING_FILE);
            expect(isExisting(NON_EXISTING_FILE)).toEqual(false);
        });
    });
    describe('✅ list()', () => {
        const FN = FS.list;
        beforeEach(() => {
            mock.restore();
            mock({
                tmp: {
                    'file.txt': 'xx',
                    'file.json': '{ "xxx": 2}',
                },
                foo: {
                    'file.txt': 'xx',
                    bar: {
                        'file.txt': 'xx',
                    },
                },
                tmpEmpty: {},
            });
        });
        describe('should return list of files', () => {
            it('from sub-folder [absolute path, recursive=true]', () => {
                const EXPECTED = ['tmp/file.json', 'tmp/file.txt'];
                expect(FN(`tmp`)).toEqual(EXPECTED);
                expect(FN(`tmp/`)).toEqual(EXPECTED);
            });
            it('from sub-folder with sub-folder [absolute path, recursive=true]', () => {
                const EXPECTED = ['foo/bar/file.txt', 'foo/file.txt'];
                expect(FN(`foo`)).toEqual(EXPECTED);
                expect(FN(`foo/`)).toEqual(EXPECTED);
            });
            it('from sub-folder with sub-folder [relative path, recursive=true]', () => {
                const EXPECTED = ['file.txt', 'file.txt'];
                expect(FN(`foo`, true, false)).toEqual(EXPECTED);
                expect(FN(`foo/`, true, false)).toEqual(EXPECTED);
            });

            it('from sub-folder [relative path, recursive=false]', () => {
                const EXPECTED = ['file.json', 'file.txt'];
                expect(FN(`tmp`, true, false)).toEqual(EXPECTED);
                expect(FN(`tmp/`, true, false)).toEqual(EXPECTED);
            });
            it('from root-Folder [absolute path, recursive=true]', () => {
                const EXPECTED: string[] = [
                    'foo/bar/file.txt',
                    'foo/file.txt',
                    'tmp/file.json',
                    'tmp/file.txt',
                ];
                expect(FN(`./`)).toEqual(EXPECTED);
                expect(FN(``)).toEqual(EXPECTED);
            });
            it('from "tmp"-Folder recursively', () => {
                const EXPECTED = ['file.json', 'file.txt'];
                expect(FN(`tmp`, true, false)).toEqual(EXPECTED);
            });
            it('should return list of files from foo-Folder not recursively', () => {
                const EXPECTED = ['foo/file.txt'];
                expect(FN(`./foo`, false)).toEqual(EXPECTED);
                expect(FN(`foo/`, false)).toEqual(EXPECTED);
            });
        });

        describe('should return empty list of files', () => {
            it('from root-Folder [absolute path, recursive=false]', () => {
                const EXPECTED: string[] = [];
                expect(FN(`./`, false)).toEqual(EXPECTED);
                expect(FN(``, false)).toEqual(EXPECTED);
            });
            it('should return empty list of files', () => {
                expect(FN(`tmpEmpty`)).toEqual([]);
                expect(FN(`tmpEmpty/`)).toEqual([]);
                expect(FN(`notexitss`)).toEqual([]);
                expect(FN(`note   xitss`)).toEqual([]);
            });
        });
        describe('errors', () => {
            it('should return empty list when path not exists and get CI info', () => {
                const logSpy = jest.spyOn(LOG, 'WARN');
                const EXPECTED: string[] = [];
                expect(FN(`nope`)).toEqual(EXPECTED);
                const logArg = logSpy.mock.calls[0][0];
                expect(logArg).toEqual(expect.stringMatching(/@.*fs\.ts:\d+/));
                expect(logArg).toEqual(expect.stringContaining('FS.list()@'));
                expect(logArg).toEqual(
                    expect.stringContaining('Path nope does not exist.')
                );
                logSpy.mockRestore();
            });
        });
    });
    describe('✅ listDetails()', () => {
        const FN = FS.listDetails;
        beforeEach(() => {
            mock.restore();
            mock({
                tmp: {
                    'file.txt': 'xx',
                    'file.json': '{ "xxx": 2}',
                },
                foo: {
                    'file.txt': 'xx',
                    bar: {
                        'file.txt': 'xx',
                    },
                },
                tmpEmpty: {},
            });
        });
        describe('should return detailed list of files', () => {
            it('from sub-folder [absolute path, recursive=true]', () => {
                const EXPECTED: FileItems = [
                    { path: 'tmp/file.json', type: 'file' },
                    { path: 'tmp/file.txt', type: 'file' },
                ];
                expect(FN(`tmp`)).toEqual(EXPECTED);
                expect(FN(`tmp/`)).toEqual(EXPECTED);
            });
            it('from sub-folder with sub-folder [absolute path, recursive=true]', () => {
                const EXPECTED: FileItems = [
                    { path: 'foo/bar/file.txt', type: 'file' },
                    { path: 'foo/bar', type: 'folder' },
                    { path: 'foo/file.txt', type: 'file' },
                ];
                expect(FN(`foo`)).toEqual(EXPECTED);
                expect(FN(`foo/`)).toEqual(EXPECTED);
            });
            it('from sub-folder with sub-folder [relative path, recursive=true]', () => {
                const EXPECTED: FileItems = [
                    { path: 'foo/bar/file.txt', type: 'file' },
                    { path: 'foo/bar', type: 'folder' },
                    { path: 'foo/file.txt', type: 'file' },
                ];
                expect(FN(`foo`, true)).toEqual(EXPECTED);
                expect(FN(`foo/`, true)).toEqual(EXPECTED);
            });

            it('from sub-folder [relative path, recursive=false]', () => {
                const EXPECTED: FileItems = [
                    { path: 'tmp/file.json', type: 'file' },
                    { path: 'tmp/file.txt', type: 'file' },
                ];
                expect(FN(`tmp`, true)).toEqual(EXPECTED);
                expect(FN(`tmp/`, true)).toEqual(EXPECTED);
            });
            it('from root-Folder [absolute path, recursive=true]', () => {
                const EXPECTED: FileItems = [
                    { path: 'foo/bar/file.txt', type: 'file' },
                    { path: 'foo/bar', type: 'folder' },
                    { path: 'foo/file.txt', type: 'file' },
                    { path: 'foo', type: 'folder' },
                    { path: 'tmp/file.json', type: 'file' },
                    { path: 'tmp/file.txt', type: 'file' },
                    { path: 'tmp', type: 'folder' },
                    { path: 'tmpEmpty', type: 'folder' },
                ];
                expect(FN(`./`)).toEqual(EXPECTED);
                expect(FN(``)).toEqual(EXPECTED);
            });
            it('from "tmp"-Folder recursively', () => {
                const EXPECTED: FileItems = [
                    { path: 'tmp/file.json', type: 'file' },
                    { path: 'tmp/file.txt', type: 'file' },
                ];
                expect(FN(`tmp`, true)).toEqual(EXPECTED);
            });
            it('should return list of files from foo-Folder not recursively', () => {
                const EXPECTED: FileItems = [
                    { path: 'foo/file.txt', type: 'file' },
                ];
                expect(FN(`./foo`, false)).toEqual(EXPECTED);
                expect(FN(`foo/`, false)).toEqual(EXPECTED);
            });
            it('should return empty list for not existing folder', () => {
                const spyLog = jest.spyOn(LOG, 'WARN');
                const EXPECTED: FileItems = [];
                expect(FN(`nope/`, false)).toEqual(EXPECTED);
                expect(spyLog).toHaveBeenCalledWith(
                    expect.stringContaining('Path nope/ does not exist.')
                );
                spyLog.mockRestore();
            });
        });
    });
    describe('✅ sizeContent()', () => {
        const FN = FS.sizeContent;
        it('size of content', () => {
            expect(FN('A')).toEqual(1);
            expect(FN('Ψ')).toEqual(2);
            expect(FN('💾')).toEqual(4);
            expect(FN({ xxx: 2 })).toEqual(9);
        });
    });
    describe('✅ size', () => {
        const FN = FS.size;
        it('size of file', () => {
            expect(FN(`notexitst`)).toEqual(0);
            expect(FN(`tmp/file.txt`)).toEqual(2);
            expect(FN(`tmp/file.json`)).toEqual(9);
        });
    });
});