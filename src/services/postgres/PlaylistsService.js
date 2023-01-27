/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(songsService, collaborationsService) {
    this._pool = new Pool();
    this._songService = songsService;
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3, $4, $4) RETURNING id',
      values: [id, name, owner, createdAt],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.owner = $1 OR collaborations.user_id = $1
      GROUP BY playlists.id, users.username`,
      values: [owner],
    };
    const { rows } = await this._pool.query(query);
    return rows;
  }

  async deletePlaylistsById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongByPlaylistId(playlistId, songId, credentialId) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();

    // memeriksa apakah ada song yang sesuai dengan songId yang diberikan
    await this._songService.getSongById(songId);

    const query1 = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3, $4, $4) RETURNING id',
      values: [id, playlistId, songId, createdAt],
    };
    const { rows } = await this._pool.query(query1);
    if (!rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan pada playlist');
    }

    await this.addActivities(playlistId, songId, credentialId, 'add');

    return rows[0].id;
  }

  async getSongsByPlaylistId(playlistId) {
    const query1 = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1`,
      values: [playlistId],
    };
    const result1 = await this._pool.query(query1);
    const playlist = result1.rows[0];

    const query2 = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM playlist_songs LEFT JOIN songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1 ',
      values: [playlistId],
    };
    const { rows } = await this._pool.query(query2);
    playlist.songs = rows;

    return playlist;
  }

  async deleteSongByPlaylistId(playlistId, songId, credentialId) {
    // memeriksa apakah ada song yang sesuai dengan songId yang diberikan
    await this._songService.getSongById(songId);

    const query1 = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING ID',
      values: [playlistId, songId],
    };
    const { rows } = await this._pool.query(query1);

    if (!rows.length) {
      throw new NotFoundError('Lagu di dalam playlist tidak tidak ditemukan');
    }

    await this.addActivities(playlistId, songId, credentialId, 'delete');
  }

  async getActivitiesByPlaylistId(playlistId) {
    const query1 = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time 
      FROM playlist_song_activities
      LEFT JOIN users ON users.id = playlist_song_activities.user_id
      LEFT JOIN songs ON songs.id = playlist_song_activities.song_id
      WHERE playlist_song_activities.playlist_id = $1
      ORDER BY playlist_song_activities.time`,
      values: [playlistId],
    };
    const { rows } = await this._pool.query(query1);

    if (!rows.length) {
      throw new NotFoundError('Daftar activities tidak ditemukan');
    }
    return rows;
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses playlist ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addActivities(playlistId, songId, credentialId, action) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, credentialId, action, createdAt],
    };
    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Activities gagal ditambahkan pada playlist_song_activities');
    }

    return rows[0].id;
  }
}

module.exports = PlaylistsService;
