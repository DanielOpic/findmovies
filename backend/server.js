const express = require('express');
const cors = require('cors');
const { connect } = require('./db');  // Importujemy funkcję connect
const moviesRoutes = require('./routes/movies');
const similarRoutes = require('./routes/similar');
const config = require('./config');

const app = express();
const PORT = config.PORT;

// Połączenie z MongoDB
connect();

// Middleware
app.use(cors());
app.use(express.json());

// Rejestrowanie tras
app.use('/api/movies', moviesRoutes);
app.use('/api/similar', similarRoutes);

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`✅ Backend działa na http://localhost:${PORT}`);
});
