import { Request, Response } from 'express';
export declare const getNotifications: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const markAsRead: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const markAllAsRead: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteNotification: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createNotification: (userId: string, eventId: string | null, type: string, title: string, message: string, reminderTime?: string) => Promise<string>;
export declare const getUnreadCount: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=notifications.d.ts.map