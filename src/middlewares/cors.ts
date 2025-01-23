// src/middlewares/cors.ts
import { cors } from 'hono/cors';

export const corsMiddleware = cors({
    origin: ['http://localhost:3000'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-API-Version'],
    maxAge: 86400,
    credentials: true,
});
