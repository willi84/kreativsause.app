export type SheetCell = {
    f?: string;
    v?: boolean | number | string | null;
};

export type SheetRow = {
    c?: Array<SheetCell | null>;
};

export type GoogleSheetTable = {
    rows?: SheetRow[];
};
export type GoogleSheetResponse = {
    table?: GoogleSheetTable;
};
export type ProjectItem = Record<string, string>;