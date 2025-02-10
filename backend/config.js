require('dotenv').config();

module.exports = {
  MONGO_USER: process.env.MONGO_USER,
  MONGO_PASSWORD: process.env.MONGO_PASSWORD,
  MONGO_CLUSTER: process.env.MONGO_CLUSTER,
  MONGO_DB: process.env.MONGO_DB,
  MONGO_APP_NAME: process.env.MONGO_APP_NAME,
  PORT: 5000 
};

