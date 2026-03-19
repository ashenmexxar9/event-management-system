import { Request, Response } from 'express';
export declare const getFeedbacksForEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getFeedbacksByUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createFeedback: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateFeedback: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteFeedback: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getFeedbackStats: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=feedbacks.d.ts.map