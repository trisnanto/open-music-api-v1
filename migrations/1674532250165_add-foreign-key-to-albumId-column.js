/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // memberikan constraint foreign key pada albumId terhadap kolom id dari tabel albums
  pgm.addConstraint('songs', 'fk_songs.albumId_albums.id', 'FOREIGN KEY("albumId") REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // menghapus constraint fk_songs.albumId_albums.id pada tabel songs
  pgm.dropConstraint('songs', 'fk_songs.albumId_albums.id');
};
