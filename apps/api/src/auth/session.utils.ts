import type { Request } from 'express';

export function destroySession(req: Request) : Promise<void> {
    return new Promise<void>((resolve, reject) => {
        req.session.destroy((err) => (err ? reject(err) : resolve()));
    });
}