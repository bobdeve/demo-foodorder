const express = require('express');
const { MongoClient, ObjectId } = require('mongodb'); // Import MongoClient and ObjectId for MongoDB operations

const app = express();
const port = 3000;

const uri = 'mongodb://localhost:27017'; // MongoDB connection URI

// Function to connect to MongoDB
const connectToMongoDB = async () => {
    const client = new MongoClient(uri); // Create a new MongoClient instance
    try {
        await client.connect(); // Connect to MongoDB
        console.log('Connected to MongoDB successfully!');
        return client; // Return the connected client
    } catch (error) {
        console.error('Error connecting to MongoDB:', error); // Log connection error
        process.exit(1); // Exit the process on failure
    }
};

// Route to get all books from the "books" collection
app.get('/books', async (req, res) => {
    const client = await connectToMongoDB(); // Connect to MongoDB
    const database = client.db('bookstore'); // Select the "bookstore" database
    const collection = database.collection('books'); // Select the "books" collection

    try {
        const allCollection = await collection.find().toArray(); // Retrieve all documents as an array
        console.log(allCollection)
        res.json(allCollection); // Send the books array as a JSON response
    } catch (error) {
        res.status(500).send("Error retrieving collection"); // Send error if the query fails
    } finally {
        await client.close(); // Close the database connection after processing
    }
});

// Route to get a book by its unique MongoDB ID
app.get('/books/:id', async (req, res) => {
    const client = await connectToMongoDB(); // Connect to MongoDB
    const database = client.db('bookstore'); // Select the "bookstore" database
    const collection = database.collection('books'); // Select the "books" collection

    const bookId = req.params.id; // Get the book ID from the request URL parameter

    try {
        // Check if the provided ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(bookId)) {
            return res.status(400).json({ error: 'Invalid ID format!' }); // Send error if ID is invalid
        }

        // Find the book document with the specified _id
        const book = await collection.findOne({ _id: new ObjectId(bookId) });

        if (book) {
            res.json(book); // Send the found book as a JSON response
        } else {
            res.status(404).json({ error: 'Book not found!' }); // Send error if book is not found
        }
    } catch (error) {
        res.status(500).send("Error retrieving book by ID"); // Send error if there's a server issue
    } finally {
        await client.close(); // Close the database connection after processing
    }
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`App is running on port ${port}! 🚀`); // Log server startup message
});