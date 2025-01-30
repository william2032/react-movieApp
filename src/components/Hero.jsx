import {useEffect, useState} from 'react';
import Search from "./Search.jsx";
import Spinner from "./Spinner.jsx";
import MovieCard from "./MovieCard.jsx";
import {useDebounce} from 'react-use'

import {getTrendingMovies, updateSearchCount} from "./Appwrite.js";


const API_BASE_URL = " https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_APP_TMDB_API_KEY;


const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}


const Hero = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [trendingMovies, setTrendingMovies] = useState([]);

    // Debounce the search term to prevent making too many API requests
    // by waiting for the user to stop typing for 500ms
    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);


    const fetchMovies = async (query) => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
            const response = await fetch(endpoint, API_OPTIONS);


            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }

            const data = await response.json(); //collect the api json

            if (data.response === 'False') {
                setErrorMessage(data.error || 'Failed to fetch movies');
                setMovieList([]);
                return;
            }

            setMovieList(data.results || []);

            if (query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
            }

        } catch (error) {
            console.log(error);
            setErrorMessage('Error fetching movies.Try another key word');
        } finally {
            setIsLoading(false);
        }


    }

    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();

            setTrendingMovies(movies)
        } catch (error) {
            console.log(`Error fetching trending movies: ${error}`);
        }

    }
    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, [])
    return (
        <main>
            <div className="pattern overflow-x-hidden scroll-smooth">
                <div className="wrapper">
                    <header>
                        <img src="/hero.png" alt="logo"/>
                        <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
                        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
                    </header>


                    {trendingMovies.length > 0 && (
                        <section className="trending">
                            <h2>Trending today</h2>

                            <ul>
                                {trendingMovies.map((movie, index) => (
                                    <li key={movie.$id }>
                                        <p className=" px-[25px] space-x-2" > {index + 1}</p>
                                        <img src={movie.poster_url} alt={movie.title}/>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}


                    <section className="all-movies">
                        <h2 className="mt-8 ">All movies</h2>
                        {isLoading ? (
                            <Spinner/>
                        ) : errorMessage ? (
                            <p className="text-white"> {errorMessage}</p>
                        ) : (
                            <ul>
                                {movieList.map((movie) => (
                                    <MovieCard key={movie.id} movie={movie}/>
                                ))}
                            </ul>
                        )}

                    </section>

                </div>
            </div>
        </main>
    );
};

export default Hero;