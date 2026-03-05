import { Request, Response } from 'express';
export declare const getVendors: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createVendor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateVendor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteVendor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getExpenses: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createExpense: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateExpense: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteExpense: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=budget.d.ts.map