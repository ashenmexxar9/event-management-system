import { Request, Response } from 'express';
export declare const getRegistrations: (req: Request, res: Response) => Promise<void>;
export declare const createRegistration: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateRegistration: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteRegistration: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=registrations.d.ts.map