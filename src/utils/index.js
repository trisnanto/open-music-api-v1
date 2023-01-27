/* eslint-disable camelcase */
const mapAlbumDBToAlbumModel = ({
  id,
  name,
  year,
  cover,
  created_at,
  updated_at,
}) => ({
  id,
  name,
  year,
  coverUrl: cover,
  createdAt: created_at,
  updatedAt: updated_at,
});

const mapSongDBToSongModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
});

module.exports = { mapAlbumDBToAlbumModel, mapSongDBToSongModel };
