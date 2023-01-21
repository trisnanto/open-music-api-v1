/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapSongDBToSongModel } = require('../../utils');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, genre, performer, duration = null, albumId = null,
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    const query = {
      text: '',
    };
    if (!title && !performer) {
      query.text = 'SELECT * FROM songs';
    } else if (title && !performer) {
      query.text = 'SELECT * FROM songs WHERE LOWER(songs.title) LIKE $1';
      query.values = [`%${title}%`];
    } else if (!title && performer) {
      query.text = 'SELECT * FROM songs WHERE LOWER(songs.performer) LIKE $1';
      query.values = [`%${performer}%`];
    } else if (title && performer) {
      query.text = 'SELECT * FROM songs WHERE LOWER(songs.title) LIKE $1 AND LOWER(songs.performer) LIKE $2';
      query.values = [`%${title}%`, `%${performer}%`];
    }
    const result = await this._pool.query(query);
    const songs = result.rows.map(mapSongDBToSongModel);
    return songs.map((song) => ({ id: song.id, title: song.title, performer: song.performer }));
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows.map(mapSongDBToSongModel)[0];
  }

  async editSongById(id, {
    title, year, genre, performer, duration = null, albumId = null,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "albumId" = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
