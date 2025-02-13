// routes/movies.js

const express = require('express');
const { MongoClient } = require('mongodb');
const config = require('../config');
const router = express.Router();

// Inicjalizuję klienta MongoDB
const client = new MongoClient(
  `mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASSWORD}@${config.MONGO_CLUSTER}/?retryWrites=true&w=majority&appName=TaskCluster`
);

// Szukam filmów na podstawie tytułu
router.post('/', async (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Tytuł filmu jest wymagany!' });
  }

  try {
    await client.connect();
    const database = client.db('sample_mflix');
    const collection = database.collection('embedded_movies');

    // Szukam filmów, ignorując wielkość liter, sortuję malejąco po roku i ograniczam do 10 wyników
    const movies = await collection
      .find({ title: { $regex: title, $options: 'i' } })
      .sort({ year: -1 })
      .limit(10)
      .project({
        _id: 1,
        title: 1,
        year: 1,
        plot: 1,
        score: 1,
        cast: 1,
        countries: 1,
        directors: 1,
      })
      .toArray();

    // Formatuję wyniki przed zwróceniem
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
