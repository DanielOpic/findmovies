const express = require('express');
const cors = require('cors');
const { connect } = require('./db');
const moviesRoutes = require('./routes/movies');
const similarRoutes = require('./routes/similar');
const config = require('./config');

const app = express();
const PORT = config.PORT;

// Łączę się z bazą
connect();

// Middleware
app.use(cors());
app.use(express.json());

// Rejestruję trasy
app.use('/api/movies', moviesRoutes);
app.use('/api/similar', similarRoutes);

// Uruchamiam serwer na podanym porcie
app.listen(PORT, () => {
  console.log(`Backend działa na http://localhost:${PORT}`);
});
