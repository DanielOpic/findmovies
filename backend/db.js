const { MongoClient } = require('mongodb');
const config = require('./config');

// Inicjalizuję MongoDB
const client = new MongoClient(
  `mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASSWORD}@${config.MONGO_CLUSTER}/?retryWrites=true&w=majority&appName=${config.MONGO_APP_NAME}`
);

// Łączę się z bazą
async function connect() {
  try {
    await client.connect();
    console.log('Połączono z bazą');
  } catch (error) {
    console.error('Błąd połączenia z bazą:', error);
    throw error;
  }
}

module.exports = { client, connect };
