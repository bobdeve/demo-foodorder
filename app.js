const express = require('express');
const { connectionToDb, getDb } = require('./db');
const { ObjectId } = require('mongodb');

const app = express();
app.use(express.json());

let db;

const init = async () => {
    try {
        await connectionToDb(); // Establish connection to the database
        db = getDb(); // Get the database instance

        console.log('Connected to the database');

        // GET route to fetch a sample of movies from the 'movies' collection
        app.get('/foods', async (req, res) => {
            try {
                const food = await db.collection('foods')
                    .find()
                    .limit(30) // Limit to 10 movies for demonstration
                    .toArray();

                res.status(200).json(food);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Could not fetch the movies' });
            }
        });

        // Start the server
        app.listen(3000, () => {
            console.log('App listening on port 3000');
        });
    } catch (err) {
        console.error('Failed to connect to the database:', err);
    }
};

init();
