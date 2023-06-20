import {
    getArtists,
    getArtistById,
    getAlbums,
    getAlbumById,
    getAlbumsByArtist,
    createArtist,
    createAlbum,
    updateArtist,
    deleteAlbum,
    deleteArtist,
} from './mysql.js';

import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLBoolean,
    GraphQLSchema,
} from 'graphql';

const ArtistType = new GraphQLObjectType({
    name: 'ArtistType',
    fields: () => ({
        artist_id: { type: GraphQLInt },
        artist_name: { type: GraphQLString },
        date_of_birth: { type: GraphQLString },
        // Albums
        albums: {
            type: new GraphQLList(AlbumType),
            resolve(parentValue, args) {
                const artist_id = parentValue.artist_id;
                return getAlbumsByArtist(artist_id);
            },
        },
    }),
});

const AlbumType = new GraphQLObjectType({
    name: 'AlbumType',
    fields: () => ({
        album_id: { type: GraphQLInt },
        album_name: { type: GraphQLString },
        release_year: { type: GraphQLString },
        artist_id: { type: GraphQLInt },
        // Artists
        artist: {
            type: ArtistType,
            resolve(parentValue, args) {
                const artist_id = parentValue.artist_id;
                return getArtistById(artist_id);
            },
        },
    }),
});

const query = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        artists: {
            type: new GraphQLList(ArtistType),
            resolve() {
                const artists = getArtists();
                return artists;
            },
        },
        artist: {
            type: ArtistType,
            args: { artist_id: { type: GraphQLInt } },
            resolve(_, { artist_id }) {
                const artist = getArtistById(artist_id);
                return artist;
            },
        },
        albums: {
            type: new GraphQLList(AlbumType),
            resolve() {
                const albums = getAlbums();
                return albums;
            },
        },
        album: {
            type: AlbumType,
            args: { album_id: { type: GraphQLInt } },
            resolve(_, { album_id }) {
                const album = getAlbumById(album_id);
                return album;
            },
        },
    },
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        createArtist: {
            type: ArtistType,
            args: {
                artist_name: { type: GraphQLString },
                date_of_birth: { type: GraphQLInt },
            },
            resolve(parentValue, args) {
                const { artist_name, date_of_birth } = args;
                const artist = {
                    artist_name,
                    date_of_birth,
                };
                return createArtist(artist);
            },
        },
        createAlbum: {
            type: AlbumType,
            args: {
                artist_id: { type: GraphQLInt },
                album_name: { type: GraphQLString },
                release_year: { type: GraphQLInt },
            },
            resolve(parentValue, args) {
                const { artist_id, album_name, release_year } = args;

                const album = {
                    album_name,
                    release_year,
                };
                return createAlbum(album, artist_id);
            },
        },
        updateArtist: {
            type: ArtistType,
            args: {
                artist_id: { type: GraphQLInt },
                artist_name: { type: GraphQLString },
                date_of_birth: { type: GraphQLString },
            },
            async resolve(parentValue, args) {
                const { artist_id, artist_name, date_of_birth } = args;

                const updatedArtist = {
                    artist_name,
                    date_of_birth,
                };

                const success = await updateArtist(artist_id, updatedArtist);

                if (success) {
                    const updatedArtistData = await getArtistById(artist_id);
                    return updatedArtistData;
                }
            },
        },
        deleteArtist: {
            type: GraphQLBoolean,
            args: {
                artist_id: { type: GraphQLInt },
            },
            resolve(parentValue, args) {
                const { artist_id } = args;
                return deleteArtist(artist_id);
            },
        },
        deleteAlbum: {
            type: GraphQLBoolean,
            args: {
                album_id: { type: GraphQLInt },
            },
            resolve(parentValue, args) {
                const { album_id } = args;
                return deleteAlbum(album_id);
            },
        },
    }),
});

export default new GraphQLSchema({
    query,
    mutation,
});
