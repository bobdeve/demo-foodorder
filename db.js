const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();  // Add this line to load environment variables

const uri = process.env.MONGODB_URI;  // Use the environment variable

let dbConnection;

module.exports = {
    connectionToDb: async () => {
        try {
            const client = new MongoClient(uri, {
                serverApi: {
                    version: ServerApiVersion.v1,
                    strict: true,
                    deprecationErrors: true,
                },
            });

            // Connect to the database
            await client.connect();

            // Store the database connection for the 'meals' database
            dbConnection = client.db("meals");

            console.log("Connected to MongoDB Atlas, meals database");
        } catch (err) {
            console.error('Failed to connect to the database:', err);
            throw err;
        }
    },

    getDb: () => {
        if (!dbConnection) {
            throw new Error('Database connection is not established. Call connectionToDb first.');
        }
        return dbConnection;
    }
};