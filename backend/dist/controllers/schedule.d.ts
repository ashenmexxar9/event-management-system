import { Request, Response } from 'express';
export declare const getScheduleItems: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createScheduleItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateScheduleItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteScheduleItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getTasks: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=schedule.d.ts.map