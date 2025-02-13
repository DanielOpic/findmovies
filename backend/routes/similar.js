const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
const config = require('../config');

// Inicjalizuję MongoDB
const client = new MongoClient(
  `mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASSWORD}@${config.MONGO_CLUSTER}/?retryWrites=true&w=majority&appName=TaskCluster`
);

// Wyszukuję podobne filmy na podstawie ID
router.post('/', async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Id filmu jest wymagane!' });
  }

  try {
    await client.connect();
    const collection = client.db('sample_mflix').collection('embedded_movies');

    // Pobieram film na podstawie ID
    const movie = await collection.findOne({ _id: new ObjectId(id) });

    if (!movie) {
      return res.status(404).json({ error: 'Film nie znaleziony!' });
    }

    const plotEmbedding = movie.plot_embedding;
    if (!plotEmbedding) {
      res.json({ movies: [] });
      return true;
    }

    // Tworzę pipeline z wyszukiwaniem wektorowym
    const pipeline = [
      {
        "$vectorSearch": {
          "index": "plot_embedding_index",
          "path": "plot_embedding",
          "queryVector": plotEmbedding,
          "numCandidates": 500,
          "limit": 50
        }
      },
      {
        "$project": {
          _id: 1,
          title: 1,
          year: 1,
          plot: 1,
          score: 1,
          cast: 1,
          countries: 1,
          directors: 1,
          "score": { $meta: 'vectorSearchScore' }
        }
      }
    ];
    const results = await collection.aggregate(pipeline).toArray();

    // Łapię unikalne filmy na podstawie tytułu i roku
    const seenMovies = new Set();
    const uniqueMovies = [];

    for (const movie of results) {
      if (movie.score === 1) continue;

      const movieKey = `${movie.title}-${movie.year}`;
      if (!seenMovies.has(movieKey)) {
        seenMovies.add(movieKey);

        // Formatuję rok, jeśli zawiera 'è'
        let formattedYear = movie.year;
        if (typeof formattedYear === 'string') {
          formattedYear = formattedYear.replace('è', ' - ');
        }

        uniqueMovies.push({
          _id: movie._id,
          title: movie.title,
          plot: movie.plot,
          year: formattedYear,
          castear: movie.cast,
          countries: movie.countries,
          directors: movie.directors,
          score: Math.round(movie.score * 100)
        });
      }

      if (uniqueMovies.length === 10) break;
    }

    res.json({ movies: uniqueMovies });

  } catch (error) {
    console.error('Błąd przy przetwarzaniu zapytania:', error);
    res.status(500).json({ error: 'Wystąpił błąd przy wyszukiwaniu podobnych filmów' });
  } finally {
    await client.close();
  }
});

module.exports = router;
