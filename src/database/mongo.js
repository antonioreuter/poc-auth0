const { MongoClient } = require('mongodb');
const config = require('config');

let database = null;

async function startDatabase() {
  const mongoDBURL = config.get('database.DB_URL');
  const connection = await MongoClient.connect(mongoDBURL, { useNewUrlParser: true });
  database = connection.db();
}

async function getDatabase() {
  if (!database) await startDatabase();
  return database;
}

module.exports = {
  getDatabase,
  startDatabase,
};