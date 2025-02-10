const { MongoClient } = require('mongodb');
const config = require('./config');

// Tworzymy instancję klienta MongoDB
const client = new MongoClient(
  `mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASSWORD}@${config.MONGO_CLUSTER}/?retryWrites=true&w=majority&appName=${config.MONGO_APP_NAME}`
);


// Funkcja do połączenia z bazą
async function connect() {
  try {
    await client.connect();
    console.log('✅ Połączono z MongoDB');
  } catch (error) {
    console.error('❌ Błąd połączenia z MongoDB:', error);
    throw error;
  }
}

// Eksportujemy klienta i funkcję connect
module.exports = { client, connect };
