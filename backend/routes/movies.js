// routes/movies.js

const express = require('express');
const { MongoClient } = require('mongodb');
const config = require('../config');
const router = express.Router();

// Inicjalizujemy klienta MongoDB
const client = new MongoClient(
  `mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASSWORD}@${config.MONGO_CLUSTER}/?retryWrites=true&w=majority&appName=TaskCluster`
);

// Endpoint do wyszukiwania filmów na podstawie tytułu
router.post('/', async (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Tytuł filmu jest wymagany!' });
  }

  try {
    // Łączymy się z bazą danych
    await client.connect();
    const database = client.db('sample_mflix');
    const collection = database.collection('embedded_movies');

    // Wyszukiwanie po tytule
    const movies = await collection
      .find({ title: { $regex: title, $options: 'i' } }) // wyszukiwanie ignorujące wielkość liter
      .sort({ year: -1 }) // Sortowanie od najnowszych (malejąco)
      .limit(10) // limitujemy do 10 wyników
      .project({
        _id: 1, // Zwracamy domyślny _id
        title: 1, // Tytuł filmu
        year: 1, // Rok produkcji
        plot: 1, // Krótki opis
        score: 1, // Podobieństwo
        cast: 1, // Lista aktorów
        countries: 1, // Lista krajów produkcji
        directors: 1, // Lista reżyserów
      })  // Ograniczamy zwracane pola do tych, które są wymagane
      .toArray();

    // Modyfikacja wyników przed zwróceniem
    const formattedMovies = movies.map(movie => ({
        ...movie,
        year: typeof movie.year === 'string' ? movie.year.replace('è', '-') : movie.year
    }));
  
    res.json({ movies: formattedMovies });

  } catch (error) {
    console.error('Błąd wyszukiwania filmów:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas wyszukiwania filmów' });
  } finally {
    await client.close();
  }
});

module.exports = router;
