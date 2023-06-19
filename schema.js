import {
    getArtists,
    getArtistById,
    getAlbums,
    getAlbumById,
    getArtistsAndAlbums,
    createArtist,
    createAlbum,
    updateAlbum,
    updateArtist,
    deleteAlbum,
    deleteArtist,
} from './mysql.js';

import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLSchema,
} from 'graphql';

const ArtistType = new GraphQLObjectType({
    name: 'ArtistType',
    fields: () => ({
        artist_id: { type: GraphQLInt },
        artist_name: { type: GraphQLString },
        date_of_birth: { type: GraphQLString },
        // Albums
        /* albums: {
            type: new GraphQLList(Album),
            resolve(parentValue, args) {
                const artist_id = parentValue.artist_id;
                return getAlbumsByArtist(artist_id);
            },
        }, */
    }),
});

const AlbumType = new GraphQLObjectType({
    name: 'AlbumType',
    fields: () => ({
        album_id: { type: GraphQLInt },
        album_name: { type: GraphQLString },
        release_year: { type: GraphQLString },
        // Artists
        artists: {
            type: new GraphQLList(ArtistType),
            resolve(parentValue, args) {
                const album_id = parentValue.album_id;
                return getArtistByAlbum(album_id);
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
            resolve(parentValue, args) {
                return getAlbums();
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
        updateArtist: {
            type: ArtistType,
            args: {
                artist_id: { type: GraphQLInt },
                artist_name: { type: GraphQLString },
            },
            async resolve(parentValue, args) {
                const { artist_id, artist_name } = args;
                const artist = await getArtistById(artist_id);

                if (artist) {
                    artist.artist_name = artist_name;

                    await updatePurchase(artist);
                }
                return artist;
            },
        },
    }),
});

export default new GraphQLSchema({
    query,
    mutation,
});
