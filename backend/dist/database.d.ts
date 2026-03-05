import sqlite3 from 'sqlite3';
export declare const db: sqlite3.Database;
export declare const runAsync: (sql: string, params?: any[]) => Promise<{
    id?: number;
}>;
export declare const getAsync: (sql: string, params?: any[]) => Promise<any>;
export declare const allAsync: (sql: string, params?: any[]) => Promise<any[]>;
export declare const initializeDatabase: () => Promise<void>;
//# sourceMappingURL=database.d.ts.map