import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import { cors } from 'hono/cors'
import { prettyJSON } from 'hono/pretty-json'
import { logger } from 'hono/logger'

// Type Definitions
interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  genre: string;
  fileUrl: string;
  streamUrl: string;
  thumbnailUrl: string;
  downloadUrl: string;
  format: string;
  bitrate: string;
  size: string;
}

interface Artist {
  id: number;
  name: string;
  genre: string;
  country: string;
  profileImage: string;
  socialLinks: {
    local?: string;
  };
}

interface Playlist {
  id: number;
  name: string;
  tracks: number[];
  createdBy: string;
  coverImage: string;
  totalDuration: string;
  trackCount: number;
}

interface SearchResults {
  tracks: Track[];
  artists: Artist[];
  playlists: Playlist[];
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  version?: string;
}

// Local File Paths
const LOCAL_PATHS = {
  tracks: '/local/tracks/',
  artists: '/local/artists/',
  playlists: '/local/playlists/',
  thumbnails: '/local/thumbnails/'
}

// Sample data with local paths
const sampleData = {
  tracks: [
    {
      id: 1,
      title: 'Shape of You',
      artist: 'Ed Sheeran',
      duration: '3:53',
      genre: 'Pop',
      fileUrl: `${LOCAL_PATHS.tracks}shape-of-you.mp3`,
      streamUrl: `/local/stream/tracks/1`,
      thumbnailUrl: `${LOCAL_PATHS.thumbnails}shape-of-you.jpg`,
      downloadUrl: `${LOCAL_PATHS.tracks}shape-of-you-download.mp3`,
      format: 'mp3',
      bitrate: '320kbps',
      size: '9.2MB'
    },
    {
      id: 2,
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      duration: '3:20',
      genre: 'Pop/R&B',
      fileUrl: `${LOCAL_PATHS.tracks}blinding-lights.mp3`,
      streamUrl: `/local/stream/tracks/2`,
      thumbnailUrl: `${LOCAL_PATHS.thumbnails}blinding-lights.jpg`,
      downloadUrl: `${LOCAL_PATHS.tracks}blinding-lights-download.mp3`,
      format: 'mp3',
      bitrate: '320kbps',
      size: '8.7MB'
    }
  ],
  artists: [
    {
      id: 1,
      name: 'Ed Sheeran',
      genre: 'Pop',
      country: 'UK',
      profileImage: `${LOCAL_PATHS.artists}ed-sheeran.jpg`,
      socialLinks: {
        local: '/local/artists/ed-sheeran'
      }
    },
    {
      id: 2,
      name: 'The Weeknd',
      genre: 'Pop/R&B',
      country: 'Canada',
      profileImage: `${LOCAL_PATHS.artists}the-weeknd.jpg`,
      socialLinks: {
        local: '/local/artists/the-weeknd'
      }
    }
  ],
  playlists: [
    {
      id: 1,
      name: 'Top Hits',
      tracks: [1, 2],
      createdBy: 'admin',
      coverImage: `${LOCAL_PATHS.playlists}top-hits.jpg`,
      totalDuration: '7:13',
      trackCount: 2
    }
  ]
}

// API Versioning Middleware
const apiVersion = (version: string) => {
  return async (c: any, next: () => Promise<void>) => {
    c.set('apiVersion', version)
    await next()
  }
}

// Create Hono App
const app = new Hono()

// Middleware Configuration
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Version'],
  maxAge: 86400,
  credentials: true
}))

// Authentication Middleware
app.use(
  '/admin/*',
  basicAuth({
    username: 'admin',
    password: 'kastaumuzik123'
  })
)

// Version 1 Routes
const v1 = new Hono()
v1.use('*', apiVersion('1.0'))

// Tracks Routes
const tracks = new Hono()

// Get Tracks with Filtering
tracks.get('/', prettyJSON(), (c) => {
  const genre = c.req.query('genre')
  const artist = c.req.query('artist')
  const version = c.get('apiVersion')

  let filteredTracks = sampleData.tracks

  if (genre) {
    filteredTracks = filteredTracks.filter(t =>
      t.genre.toLowerCase() === genre.toLowerCase()
    )
  }

  if (artist) {
    filteredTracks = filteredTracks.filter(t =>
      t.artist.toLowerCase().includes(artist.toLowerCase())
    )
  }

  return c.json({
    success: true,
    data: filteredTracks,
    version
  } as ApiResponse<Track[]>)
})

// Get Single Track
tracks.get('/:id', (c) => {
  const id = Number(c.req.param('id'))
  const version = c.get('apiVersion')
  const track = sampleData.tracks.find(t => t.id === id)

  if (!track) {
    return c.json({
      success: false,
      message: 'Track not found',
      version
    } as ApiResponse<Track>, 404)
  }

  return c.json({
    success: true,
    data: track,
    version
  } as ApiResponse<Track>)
})

// Stream Track (Local Streaming)
tracks.get('/:id/stream', (c) => {
  const id = Number(c.req.param('id'))
  const version = c.get('apiVersion')
  const track = sampleData.tracks.find(t => t.id === id)

  if (!track) {
    return c.json({
      success: false,
      message: 'Track not found',
      version
    } as ApiResponse<{ streamUrl: string }>, 404)
  }

  return c.json({
    success: true,
    data: {
      streamUrl: track.streamUrl
    },
    version
  } as ApiResponse<{ streamUrl: string }>)
})

// Artists Routes
const artists = new Hono()

// Get Artists
artists.get('/', (c) => {
  const version = c.get('apiVersion')
  return c.json({
    success: true,
    data: sampleData.artists,
    version
  } as ApiResponse<Artist[]>)
})

// Get Single Artist
artists.get('/:id', (c) => {
  const id = Number(c.req.param('id'))
  const version = c.get('apiVersion')
  const artist = sampleData.artists.find(a => a.id === id)

  if (!artist) {
    return c.json({
      success: false,
      message: 'Artist not found',
      version
    } as ApiResponse<Artist>, 404)
  }

  return c.json({
    success: true,
    data: artist,
    version
  } as ApiResponse<Artist>)
})

// Artists Tracks
artists.get('/:id/tracks', (c) => {
  const id = Number(c.req.param('id'))
  const version = c.get('apiVersion')
  const artist = sampleData.artists.find(a => a.id === id)

  if (!artist) {
    return c.json({
      success: false,
      message: 'Artist not found',
      version
    } as ApiResponse<Track[]>, 404)
  }

  const artistTracks = sampleData.tracks.filter(
    t => t.artist === artist.name
  )

  return c.json({
    success: true,
    data: artistTracks,
    version
  } as ApiResponse<Track[]>)
})

// Playlists Routes
const playlists = new Hono()

// Get Playlists
playlists.get('/', (c) => {
  const version = c.get('apiVersion')
  return c.json({
    success: true,
    data: sampleData.playlists,
    version
  } as ApiResponse<Playlist[]>)
})

// Get Single Playlist
playlists.get('/:id', (c) => {
  const id = Number(c.req.param('id'))
  const version = c.get('apiVersion')
  const playlist = sampleData.playlists.find(p => p.id === id)

  if (!playlist) {
    return c.json({
      success: false,
      message: 'Playlist not found',
      version
    } as ApiResponse<Playlist>, 404)
  }

  // Expand playlist tracks
  const playlistWithTracks = {
    ...playlist,
    tracks: playlist.tracks.map(trackId =>
      sampleData.tracks.find(t => t.id === trackId)
    )
  }

  return c.json({
    success: true,
    data: playlistWithTracks,
    version
  } as ApiResponse<Playlist & { tracks: Track[] }>)
})

// Global Search Endpoint
v1.get('/search', (c) => {
  const query = c.req.query('q')?.toLowerCase()
  const version = c.get('apiVersion')

  if (!query) {
    return c.json({
      success: false,
      message: 'Search query is required',
      version
    } as ApiResponse<SearchResults>, 400)
  }

  const results: SearchResults = {
    tracks: sampleData.tracks.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query)
    ),
    artists: sampleData.artists.filter(a =>
      a.name.toLowerCase().includes(query) ||
      a.genre.toLowerCase().includes(query)
    ),
    playlists: sampleData.playlists.filter(p =>
      p.name.toLowerCase().includes(query)
    )
  }

  return c.json({
    success: true,
    data: results,
    version
  } as ApiResponse<SearchResults>)
})

// Health Check
app.get('/health', (c) => c.json({
  status: 'healthy',
  version: '1.0.0',
  apiVersions: ['1.0'],
  serverTime: new Date().toISOString()
}))

// Mount V1 routes with version prefix
v1.route('/tracks', tracks)
v1.route('/artists', artists)
v1.route('/playlists', playlists)

// Mount versioned routes
app.route('/api/v1', v1)

export default app
export type { Track, Artist, Playlist, SearchResults, ApiResponse }