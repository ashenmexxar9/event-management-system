import { Request, Response } from 'express';
export declare const getSponsors: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSponsorById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createSponsor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateSponsor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteSponsor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSponsorDeals: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=sponsors.d.ts.map