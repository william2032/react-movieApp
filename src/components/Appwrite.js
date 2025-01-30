import {Databases, Query, Client, ID} from "appwrite";
import error from "eslint-plugin-react/lib/util/error.js";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DB_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;


const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(PROJECT_ID)

const database = new Databases(client)


export const updateSearchCount = async (searchTerm, movie) => {
    // check if the searchterm already exists in db
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.equal('searchTerm', searchTerm)])

        //if its exist >> update the count
        if (result.documents.length > 0) {
            const doc = result.documents[0];

            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1,
            })
            //if it doesn't exists
        } else {
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
                movie_id: movie.id,
            })
        }

    } catch (error) {
        console.log(error);
    }
}

export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(5),
            Query.orderDesc("count")])

      return result.documents;

    } catch (error) {
        console.log(error);
    }
}