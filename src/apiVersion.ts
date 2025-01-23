// src/apiVersion.ts
export const apiVersion = (version: string) => {
  return async (c: any, next: () => Promise<void>) => {
    c.set('apiVersion', version);
    await next();
  };
};
