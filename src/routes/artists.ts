// src/routes/artists.ts
import { Hono } from 'hono';
import { sampleData } from '../sampleData'; // Make sure to export sampleData
import { paginate } from '../utils';

const artists = new Hono();

// Get Artists with Pagination
artists.get('/', (c) => {
    const page = Number(c.req.query('page') || 1);
    const limit = Number(c.req.query('limit') || 10);
    const version = c.get('apiVersion');

    const paginatedArtists = paginate(sampleData.artists, page, limit);

    return c.json({
        success: true,
        data: paginatedArtists,
        version,
        pagination: {
            page,
            limit,
            total: sampleData.artists.length,
            totalPages: Math.ceil(sampleData.artists.length / limit),
        },
    });
});

// Get Single Artist
artists.get('/:id', (c) => {
    const id = Number(c.req.param('id'));
    const version = c.get('apiVersion');
    const artist = sampleData.artists.find(a => a.id === id);

    if (!artist) {
        return errorResponse(c, 'Artist not found', version, 404);
    }

    return c.json({
        success: true,
        data: artist,
        version,
    });
});

export { artists };
