import { convertText2JSON, filterItems, getCellValue, getHeaders, getProjects, hasCols, mapRowToItem } from './google';

const SAMPLE_JSON = {
    "version":"0.6",
    "reqId":"0",
    "status":"ok",
    "sig":"501722129",
    "table":{
        "cols":[
            {"id":"A","label":"","type":"string"},
            {"id":"B","label":"","type":"string"},
            {"id":"C","label":"","type":"string"},
        ],
        "rows":[
            {"c":[{"v":"name"},{"v":"status"},{"v":"website"}]},
            {"c":[{"v":"MetaCollect"},{"v":"inaktiv"},{"v":"https://metacollect.org/"}]},
            {"c":[{"v":"PendlerAlarm"},{"v":"aktiv"},{"v":"pendler-alarm.de"}]},
            {"c":[{"v":""},{"v":""},{"v":""}]},

        ],
        "parsedNumHeaders":0
    }
};
const SAMPLE_JSON_2 = {
    "version":"0.6",
    "reqId":"0",
    "status":"ok",
    "sig":"930504853",
    "table":{
        "cols":[
            {"id":"A","label":"name","type":"string"},
            {"id":"B","label":"start","type":"date","pattern":"dd.MM.yyyy"},
            // {"id":"C","label":"end","type":"date","pattern":"dd.MM.yyyy"},
            {"id":"D","label":"url","type":"string"},
            // {"id":"E","label":"project","type":"string"}
        ],
        "rows":[
            {"c":[{"v":"refugeeHack"},{"v":"Date(2015,9,24)","f":"24.10.2015"},{"v":"https://web.archive.org/web/20151008012010/http://refugeehackathon.de/"}]}
        ],
        "parsedNumHeaders":1
    }
};
const SAMPLE_TEXT_2 = `/*O_o*/
google.visualization.Query.setResponse(${JSON.stringify(SAMPLE_JSON_2)});`;

const SAMPLE_TEXT = `/*O_o*/
google.visualization.Query.setResponse(${JSON.stringify(SAMPLE_JSON)});`;

describe('convertText2JSON()', () => {
    const FN = convertText2JSON;
    it('should convert text to JSON', () => {
        expect(FN(SAMPLE_TEXT)).toEqual(SAMPLE_JSON);
    });
});
describe('getCellValue()', () => {
    const FN = getCellValue;
    it('should return empty string for undefined cell', () => {
        expect(FN(undefined)).toBe('');
    });
    it('should return empty string for null cell', () => {
        expect(FN(null)).toBe('');
    });
    it('should return formatted value if f is present', () => {
        expect(FN({ f: 'formatted', v: 'raw' })).toBe('formatted');
    });
    it('should return string value if v is present and f is not', () => {
        expect(FN({ v: 'value' })).toBe('value');
    });
    it('should return empty string if v is null or undefined and f is not present', () => {
        expect(FN({ v: null })).toBe('');
        expect(FN({ v: undefined })).toBe('');
    });
});

describe('hasCols()', () => {
    const FN = hasCols;
    it('should return false if table is undefined', () => {
        expect(FN(undefined)).toBe(false);
    });
    it('should return false if cols is empty', () => {
        expect(FN({ cols: [] })).toBe(false);
    });
    it('should return false if all labels are empty', () => {
        expect(FN({ cols: [{ label: '' }, { label: '   ' }] })).toBe(false);
    });
    it('should return true if at least one label is non-empty', () => {
        expect(FN({ cols: [{ label: '' }, { label: 'Name' }] })).toBe(true);
    });
});

describe('getHeaders()', () => {
    const FN = getHeaders;
    it('should return headers from the first row', () => {
        // const row = SAMPLE_JSON.table?.rows?.[0];
        const row = SAMPLE_JSON.table;
        expect(FN(row, false)).toEqual(['name', 'status', 'website']);
    });
    it('should return headers from the first row', () => {
        const row = SAMPLE_JSON_2.table;
        // const row = SAMPLE_JSON_2.table?.rows?.[0];
        expect(FN(row, true)).toEqual(['name', 'start', 'url']);
    });
});

describe('mapRowToItem()', () => {
    const FN = mapRowToItem;
    it('should map a row to an item using headers', () => {
        const headers = ['name', 'status', 'website'];
        const row = SAMPLE_JSON.table?.rows?.[1];
        expect(FN(headers, row!)).toEqual({
            name: 'MetaCollect',
            status: 'inaktiv',
            website: 'https://metacollect.org/',
        });
    });
    it('should handle missing cells in a row', () => { // TODO: sinnvoll?
        const headers = ['name', 'status', 'website'];
        const row = {  };
        expect(FN(headers, row)).toEqual({
            name: '',
            status: '',
            website: '',
        });
    });
});
describe('getProjects()', () => {
    const FN = getProjects;
    it('should return an array of project items', () => {
        expect(FN(SAMPLE_TEXT)).toEqual([
            {
                name: 'MetaCollect',
                status: 'inaktiv',
                website: 'https://metacollect.org/',
            },
            {
                name: 'PendlerAlarm',
                status: 'aktiv',
                website: 'pendler-alarm.de',
            },
        ]);
    });
    it('should return an empty array if there are no rows', () => {
        const emptyText = `google.visualization.Query.setResponse(${JSON.stringify({
            ...SAMPLE_JSON,
            table: { ...SAMPLE_JSON.table, rows: [] },
        })});`;
        expect(FN(emptyText)).toEqual([]);
    });
});
describe('filterItems()', () => {
    const FN = filterItems;
    it('should filter items based on filter columns', () => {
        const projects = [
            { name: 'Project A', status: 'active', location: 'Berlin' },
            { name: 'Project B', status: 'inactive', location: 'Hamburg' },
        ];
        const filterColumns = ['status'];
        expect(FN(projects, filterColumns)).toEqual([
            { name: 'Project A', location: 'Berlin' },
            { name: 'Project B', location: 'Hamburg' },
        ]);
    });
    it('should return all items if filter columns is empty', () => {
        const projects = [
            { name: 'Project A', status: 'active', location: 'Berlin' },
            { name: 'Project B', status: 'inactive', location: 'Hamburg' },
        ];
        const filterColumns: string[] = [];
        expect(FN(projects, filterColumns)).toEqual(projects);
    });
});
