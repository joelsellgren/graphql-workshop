import mysql from 'mysql';

const getDb = () => {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'artists_and_albums',
    });

    connection.connect();

    return connection;
};

const dbQueryCallback =
    (resolve, reject, single = false) =>
    (err, result) => {
        if (err) {
            reject(err);
            return;
        }

        if (single && result.length > 0) {
            resolve(result[0]);
        } else if (single && result.length === 0) {
            resolve(null);
        } else {
            resolve(result);
        }
    };

//Artist CRUD
export const getArtists = async () => {
    const db = getDb();

    const artists = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM artists', dbQueryCallback(resolve, reject));
    });

    return artists;
};

export const getArtistById = async (artistId) => {
    const db = getDb();

    const artist = await new Promise((resolve, reject) => {
        db.query(
            'SELECT * FROM artists WHERE artist_id = ?',
            artistId,
            dbQueryCallback(resolve, reject, true)
        );
    });

    return artist;
};

export const createArtist = async (artist) => {
    const db = getDb();

    const result = await new Promise((resolve, reject) => {
        db.query('INSERT INTO artists SET ?', artist, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.insertId);
            }
        });
    });

    return await getArtistById(result);
};

export const updateArtist = async (artistId, updatedArtist) => {
    const db = getDb();

    const result = await new Promise((resolve, reject) => {
        const query = db.query(
            'UPDATE artists SET ? WHERE artist_id = ?',
            [updatedArtist, artistId],
            dbQueryCallback(resolve, reject)
        );
        console.log(query.sql);
    });

    return result.affectedRows > 0;
};

export const deleteArtist = async (artistId) => {
    const db = getDb();

    const result = await new Promise((resolve, reject) => {
        db.query(
            'DELETE FROM artists WHERE artist_id = ?',
            artistId,
            dbQueryCallback(resolve, reject)
        );
    });

    return result !== null && result.affectedRows > 0;
};

//Album CRUD
export const getAlbums = async () => {
    const db = getDb();

    const albums = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM albums', dbQueryCallback(resolve, reject));
    });

    return albums;
};

export const getAlbumById = async (albumId) => {
    const db = getDb();

    const album = await new Promise((resolve, reject) => {
        db.query(
            'SELECT * FROM albums WHERE album_id = ?',
            albumId,
            dbQueryCallback(resolve, reject, true)
        );
    });

    return album;
};

export const createAlbum = async (album, artist_id) => {
    const db = getDb();

    const newAlbum = await new Promise((resolve, reject) => {
        // Add artist_id to the query
        db.query(
            'INSERT INTO albums SET artist_id = ?, ?',
            [artist_id, album],
            (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.insertId);
                }
            }
        );
    });

    return await getAlbumById(newAlbum);
};

export const updateAlbum = async (albumId, updatedAlbum) => {
    const db = getDb();

    const result = await new Promise((resolve, reject) => {
        db.query(
            'UPDATE albums SET ? WHERE albums_id = ?',
            [updatedAlbum, albumId],
            dbQueryCallback(resolve, reject)
        );
    });

    return result.affectedRows > 0;
};

export const deleteAlbum = async (albumId) => {
    const db = getDb();

    const result = await new Promise((resolve, reject) => {
        db.query(
            'DELETE FROM albums WHERE album_id = ?',
            albumId,
            dbQueryCallback(resolve, reject)
        );
    });

    return result !== null && result.affectedRows > 0;
};

//Get albums by artist

export const getAlbumsByArtist = async (artistId) => {
    const db = getDb();

    const albums = await new Promise((resolve, reject) => {
        db.query(
            'SELECT * FROM albums WHERE artist_id = ?',
            artistId,
            dbQueryCallback(resolve, reject)
        );
    });

    return albums;
};
