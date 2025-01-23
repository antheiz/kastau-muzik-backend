// src/routes/tracks.ts
import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import { paginate } from '../utils';
import { sampleData } from '../sampleData';  // Make sure to export sampleData

const tracks = new Hono();

// Get Tracks with Pagination and Filtering
tracks.get('/', prettyJSON(), (c) => {
    const genre = c.req.query('genre');
    const artist = c.req.query('artist');
    const page = Number(c.req.query('page') || 1);
    const limit = Number(c.req.query('limit') || 10);
    const version = c.get('apiVersion');

    let filteredTracks = sampleData.tracks;

    if (genre) {
        filteredTracks = filteredTracks.filter(t => t.genre.toLowerCase() === genre.toLowerCase());
    }

    if (artist) {
        filteredTracks = filteredTracks.filter(t => t.artist.toLowerCase().includes(artist.toLowerCase()));
    }

    const paginatedTracks = paginate(filteredTracks, page, limit);

    return c.json({
        success: true,
        data: paginatedTracks,
        version,
        pagination: {
            page,
            limit,
            total: filteredTracks.length,
            totalPages: Math.ceil(filteredTracks.length / limit),
        },
    });
});

// Get Single Track
tracks.get('/:id', (c) => {
    const id = Number(c.req.param('id'));
    const version = c.get('apiVersion');
    const track = sampleData.tracks.find(t => t.id === id);

    if (!track) {
        return errorResponse(c, 'Track not found', version, 404);
    }

    return c.json({
        success: true,
        data: track,
        version,
    });
});

export { tracks };
