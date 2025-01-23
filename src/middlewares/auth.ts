// src/middlewares/auth.ts
import { basicAuth } from 'hono/basic-auth';

export const authMiddleware = basicAuth({
    username: 'admin',
    password: 'kastaumuzik123',
});
