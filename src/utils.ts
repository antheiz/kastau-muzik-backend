// src/utils.ts
export const errorResponse = (c: any, message: string, version: string, statusCode: number) => {
    return c.json({
        success: false,
        message,
        version,
    }, statusCode);
};

export const paginate = (data: any[], page: number, limit: number) => {
    const offset = (page - 1) * limit;
    const paginatedData = data.slice(offset, offset + limit);
    return paginatedData;
};
