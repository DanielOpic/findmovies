const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
const config = require('../config');
const e = require('express');

// Połączenie z bazą danych MongoDB
const client = new MongoClient(
  `mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASSWORD}@${config.MONGO_CLUSTER}/?retryWrites=true&w=majority&appName=TaskCluster`
);

router.post('/', async (req, res) => {
  const { id } = req.body;

  if (!id) {
    console.error('Brak ID filmu w zapytaniu.');
    return res.status(400).json({ error: 'Id filmu jest wymagane!' });
  }

  try {
    console.log('Próba połączenia z MongoDB...');
    await client.connect();
    const collection = client.db('sample_mflix').collection('embedded_movies');

    console.log(`Pobieranie filmu o ID: ${id}`);
    const movie = await collection.findOne({ _id: new ObjectId(id) });  // Używamy ObjectId tutaj

    if (!movie) {
      console.error('Film o podanym ID nie znaleziony!');
      return res.status(404).json({ error: 'Film nie znaleziony!' });
    }

    const plotEmbedding = movie.plot_embedding;
    if (!plotEmbedding) {
      res.json({ movies: [] });
      
      return true;
      //console.error('Brak wektora plot_embedding w filmie.');
      //return res.status(500).json({ error: 'Film nie zawiera wektora plot_embedding' });
    }

    // Tworzymy pipeline z wyszukiwaniem wektorowym
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
          _id: 1, // Zwracamy domyślny _id
          title: 1, // Tytuł filmu
          year: 1, // Rok produkcji
          plot: 1, // Krótki opis
          score: 1, // Ocena
          cast: 1, // Lista aktorów
          countries: 1, // Lista krajów produkcji
          directors: 1, // Lista reżyserów
          "score": { $meta: 'vectorSearchScore' }
        }
      }
    ];
    const results = await collection.aggregate(pipeline).toArray();

    // Tworzymy zbiór, aby śledzić unikalne filmy na podstawie tytułu i roku
    const seenMovies = new Set();
    const uniqueMovies = [];

    // Lecimy po wynikach i dodajemy tylko filmy, które nie mają score == 1
    for (const movie of results) {
      if (movie.score === 1) {
        continue;  // Pomijamy filmy z score równym 1
      }

      // Tworzymy unikalny klucz dla filmu oparty na tytule i roku
      const movieKey = `${movie.title}-${movie.year}`;

      // Sprawdzamy, czy ten film już był dodany do wyników
      if (!seenMovies.has(movieKey)) {
        // Jeśli film nie został jeszcze dodany, dodajemy go do zbioru 'seenMovies'
        seenMovies.add(movieKey);

        // Jeśli rok zawiera 'è', zamieniamy go na '-'
        let formattedYear = movie.year;
        if (typeof formattedYear === 'string') {
          formattedYear = formattedYear.replace('è', ' - ');
        }
      
        // Dodajemy film do tablicy 'uniqueMovies'
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

      // Jeśli już mamy 10 unikalnych filmów, przerywamy pętlę
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
