const {MongoClient} = require('mongodb');

let url = 'mongodb+srv://dbtest:admin123@dbtest.fdebyxm.mongodb.net/?retryWrites=true&w=majority';

async function connectDB() {
    const client = new MongoClient(url);
    await client.connect();
    return client;
}

module.exports = connectDB;