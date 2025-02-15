'use client'

import { useState, useEffect } from 'react';
import { searchApi } from '../lib/api';

interface Movie {
  id: string;
  _id: string;
  title: string;
  year: string;
  plot: string;
  score?: number;
  cast?: string[];
  countries?: string[];
  directors?: string[];
}

export default function Home() {
  const [step, setStep] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  let timeoutId: NodeJS.Timeout;

  useEffect(() => {
    if (title.trim() === '') {
      reset();
      return;
    }
    timeoutId = setTimeout(() => {
      searchAndSetMovies(title);
    }, 900);

    return () => clearTimeout(timeoutId);
  }, [title]);

  // Wyszukuję filmy na podstawie tytułu i ustawiam wyniki
  const searchAndSetMovies = async (searchQuery: string) => {
    if (title.trim() !== '') {
      const data = await searchApi('movies', { title: title.trim() });
      if (data) {
        setMovie(null);
        setStep(1);
        setMovies(data.movies);
      }
    } else {
      reset();
    }
  };

  // Wybieram film i pobieram podobne filmy
  const chooseMovie = async (index: number) => {
    const selectedMovie = movies[index];
    setMovie(selectedMovie);
    setMovies([]);
    const data = await searchApi('similar', { id: selectedMovie._id });
    if (data) {
      setStep(2);
      setMovies(data.movies);
    }
  };

  // Resetuję stan wyszukiwania
  const reset = () => {
    setTitle('');
    setStep(0);
    setMovie(null);
    setMovies([]);
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800">
        Co dziś obejrzymy?
      </h1>

      <div className="max-w-7xl w-full p-6 bg-white shadow-lg rounded-md">
        <div className={`flex gap-6 transition-all duration-500 ${step === 0 ? 'w-full' : 'w-full md:w-auto'}`}>
          <div className={`transition-all duration-500 ${step === 0 ? 'w-full' : 'w-1/2'}`}>
            <input
              type="text"
              placeholder="Wpisz tytuł filmu"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setIsTyping(true);
              }}
            />

            {movie && (
              <div
                onClick={() => reset()}
                className="mt-6 p-4 bg-gray-50 rounded-md shadow-md transition-all duration-500 cursor-pointer"
              >
                <h2 className="text-2xl font-bold text-gray-800">
                  {movie.title} ({movie.year})
                </h2>

                {movie.score && <p className="mt-2 text-gray-700">Ocena: {movie.score}</p>}
                <p className="mt-2 text-gray-700">{movie.plot}</p>

                {movie.countries && movie.countries.length > 0 && (
                  <p className="mt-2 text-gray-700">
                    <strong>Kraje produkcji:</strong> {movie.countries.join(', ')}
                  </p>
                )}

                {movie.directors && movie.directors.length > 0 && (
                  <p className="mt-2 text-gray-700">
                    <strong>Reżyseria:</strong> {movie.directors.join(', ')}
                  </p>
                )}

                {movie.cast && movie.cast.length > 0 && (
                  <p className="mt-2 text-gray-700">
                    <strong>Obsada:</strong> {movie.cast.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>

          {step > 0 && (
            <div className="w-1/2 opacity-0 animate-fade-in transition-opacity duration-500 opacity-100">
              {step === 1 && (
                <>
                  <h2 className="text-xl font-semibold mb-4">Czy chodziło Ci o:</h2>
                  <div className="space-y-4">
                    {movies.length > 0 ? (
                      movies.map((movie) => (
                        <button
                          key={movie._id}
                          onClick={() => chooseMovie(movies.indexOf(movie))}
                          className="w-full text-left p-4 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-300"
                        >
                          {movie.title} ({movie.year})
                        </button>
                      ))
                    ) : (
                      <p className="text-gray-500">nie mam pojęcia o co ci chodziło</p>
                    )}
                  </div>

                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="text-xl font-semibold mb-4">10 najbardziej podobnych filmów:</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    {movies.length > 0 ? (
                      movies.map((movie) => (
                        <li key={movie._id} className="transition-all duration-300">
                          <h2 className="text-1xl font-bold text-gray-800">
                            <button
                              key={movie._id}
                              onClick={() => chooseMovie(movies.indexOf(movie))}
                              className="mt-3 p-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                            >
                              {movie.title} ({movie.year})
                            </button>
                          </h2>
                          {movie.score && <p className="mt-2 text-gray-700">Podobieństwo: {movie.score} %</p>}
                          <p className="mt-2 text-gray-700">{movie.plot}</p>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">Brak sugestii</li>
                    )}
                  </ul>

                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
