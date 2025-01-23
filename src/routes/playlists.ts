// src/routes/playlists.ts
import { Hono } from 'hono';
import { sampleData } from '../sampleData';  // Make sure to export sampleData
import { paginate } from '../utils';

const playlists = new Hono();

// Get Playlists with Pagination
playlists.get('/', (c) => {
    const page = Number(c.req.query('page') || 1);
    const limit = Number(c.req.query('limit') || 10);
    const version = c.get('apiVersion');

    const paginatedPlaylists = paginate(sampleData.playlists, page, limit);

    return c.json({
        success: true,
        data: paginatedPlaylists,
        version,
        pagination: {
            page,
            limit,
            total: sampleData.playlists.length,
            totalPages: Math.ceil(sampleData.playlists.length / limit),
        },
    });
});

// Get Single Playlist
playlists.get('/:id', (c) => {
    const id = Number(c.req.param('id'));
    const version = c.get('apiVersion');
    const playlist = sampleData.playlists.find(p => p.id === id);

    if (!playlist) {
        return errorResponse(c, 'Playlist not found', version, 404);
    }

    const playlistWithTracks = {
        ...playlist,
        tracks: playlist.tracks.map(trackId => sampleData.tracks.find(t => t.id === trackId)),
    };

    return c.json({
        success: true,
        data: playlistWithTracks,
        version,
    });
});

export { playlists };
