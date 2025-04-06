import { useState, useEffect } from 'react';
import Search from './components/search';
import { Loader } from './components/Loader';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  useDebounce(() => setDebouncedSearch(searchTerm), 500, [searchTerm]);
  const fetchMovies = async (query = '') => {
    setLoading(true);
    setErrorMsg('');
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURI(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const resp = await fetch(endpoint, API_OPTIONS);
      if (!resp.ok) {
        throw new Error('Failed to fetch movies');
      }
      const data = await resp.json();
      if (data.Response === 'False') {
        setErrorMsg(
          data.Error ||
            'An error occurred while fetching movies. Please try again later.'
        );
        setMovies([]);
        return;
      }
      setMovies(data.results || []);
      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMsg(
        'An error occurred while fetching movies. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchMovies(debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);
  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero-img.png" alt="Hero Image" />
          <h1>
            Find <span className="text-gradient"> Movies and TV </span>Shows
            You'll Enjoy
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending</h2>
            <ul>
              {trendingMovies.map((movie, i) => (
                <li key={movie.$id}>
                  <p>{i + 1}</p>
                  <img
                    src={movie.poster_url ? movie.poster_url : '/no-poster.png'}
                    alt={movie.id}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="all-movies">
          <h2 className="">All Movies</h2>
          {loading ? (
            <Loader />
          ) : errorMsg ? (
            <p className="text-red-500">{errorMsg}</p>
          ) : (
            <ul>
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};
export default App;
