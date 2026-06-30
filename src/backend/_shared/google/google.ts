import { AnyAaaaRecord } from 'node:dns';
import { LOG } from '../log/log';
import type { GoogleSheetResponse, ProjectItem, SheetCell, SheetRow } from "./google.d";

export const convertText2JSON = (rawText: string): GoogleSheetResponse => {
    const start = rawText.indexOf("(");
    const end = rawText.lastIndexOf(");");
    if (start === -1 || end === -1 || end <= start) {
        throw new Error("Unexpected Google Sheet response format");
    }
    const jsonText = rawText.slice(start + 1, end);
    return JSON.parse(jsonText) as GoogleSheetResponse;
};

export const getCellValue = (cell?: SheetCell | null): string => {
    if (!cell) {
        return "";
    }
    if (typeof cell.f === "string") {
        return cell.f;
    }
    if (cell.v === null || cell.v === undefined) {
        return "";
    }
    return `${cell.v}`;
};
/**
 * Checks if the table has columns with non-empty labels.
 * note: this is a workaround due to the fact that some Google Sheets have a different structure where headers are defined in the "cols" array instead of the first row of "rows".
 * @param table The Google Sheet table object to check.
 * @returns True if the table has at least one column with a non-empty label, false otherwise.
 */
export const hasCols = (table?: any): boolean => {
    const cols = table?.cols || [];
    const labels = cols.map((col: any) => col.label).filter((label: any) => typeof label === "string" && label.trim() !== "");
    const numLabels = Array.isArray(labels) ? labels.length : 0;
    return numLabels > 0;
};

export const getHeaders = (table?: any, hasCols: boolean = false): string[] => {
    const row = table?.rows?.[0];
    if(hasCols){
        const cols = table?.cols || [];
        return cols.map((col: any) => col.label || `column_${col.id}`);
    } else {
        const cells = row?.c || [];
        return cells.map((cell: SheetCell, index: number) => {
            const value = getCellValue(cell).trim();
            return value !== "" ? value : `column_${index + 1}`;
        });
    }
};

export const mapRowToItem = (headers: string[], row: SheetRow): ProjectItem => {
    const cells = row.c || [];
    return headers.reduce((result, header, index) => {
        result[header] = getCellValue(cells[index]);
        return result;
    }, {} as ProjectItem);
};

export const getProjects = (rawText: string): ProjectItem[] => {
    const sheetResponse = convertText2JSON(rawText);
    const rows = sheetResponse.table?.rows || [];
    if (rows.length === 0) {
        return [];
    }
    // const headers = getHeaders(rows[0]);
    const hasColsFlag = hasCols(sheetResponse.table);
    const headers = getHeaders(sheetResponse.table, hasColsFlag);
    const sliceStart = hasColsFlag ? 0 : 1; // If cols are present, headers are not in the first row
    return rows
        .slice(sliceStart)
        .map((row) => mapRowToItem(headers, row))
        // filter empty items (where all values are empty strings)
        .filter((item) => Object.values(item).some((value) => value.trim() !== ""));
};

export const getSheetText = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Google Sheet request failed with status ${response.status}`);
    }
    return response.text();
};
export const filterItems = (projects: any[], filterColumns: string[]) => {
    const newProjects = [];
    for(const project of projects){
        const newItem: any = {};
        const keys = Object.keys(project);
        if(filterColumns.length === 0){
            newProjects.push(project);
            continue;
        } else {
            for(const key of keys){
                if(!filterColumns.includes(key)){
                    newItem[key] = project[key];
                }
            }
            newProjects.push(newItem);
        }
    }
    return newProjects;
}
export const getRawData = async (url: string): Promise<any> => {
    const rawText: string = await getSheetText(url);
    let response = {};
    try {
        response = JSON.parse(rawText);
    } catch(error) {
        LOG.WARN(`Failed to parse JSON from ${url}: ${error instanceof Error ? error.message : `${error}`}`);
    }
    return response;
}

export const getSheetTab = async (id: string, tab: string, filterColumns: string[], allowedCols: string[]): Promise<ProjectItem[]> => {
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?sheet=${encodeURIComponent(tab)}&tqx=out:json`;
    // console.log(id);
    // console.log(SHEET_URL);
    const rawText: string = await getSheetText(SHEET_URL);
    const projects: ProjectItem[] = await getProjects(rawText)
        // filter empty items (where all values are empty strings)
        .filter((item) => Object.values(item).some((value) => value.trim() !== ""))
        // console.log(projects);
    const keys = Object.keys(projects[0] || {});
    // TODO: refactor, put in extra function check for column issues
    if(allowedCols.length > 0){
        for(const key of keys){
                if(allowedCols.indexOf(key) === -1){
                    LOG.WARN(`column  "${key}" in tab "${tab}" is not in allowed columns list and will be ignored`);
                }
            }
    }
    LOG.OK(`Fetched ${projects.length} items from tab "${tab}"`);
    const newProjects = filterItems(projects, filterColumns);
    if(JSON.stringify(projects) !== JSON.stringify(newProjects)){
        LOG.INFO(`Filtered columns: ${filterColumns.join(', ')} for tab "${tab}"`);
    }
    return newProjects.filter(item=> {
        // specific case because pin has always value
        const keys = Object.keys(item).filter(key => key !== '📌');
        return keys.some(key => item[key].trim() !== "");
    });
};
