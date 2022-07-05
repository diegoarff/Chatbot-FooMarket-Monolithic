require('dotenv').config();

const {MongoClient} = require('mongodb');

let url = process.env.URL_MONGO;

async function connectDB() {
    const client = new MongoClient(url);
    await client.connect();
    return client;
}

module.exports = connectDB;