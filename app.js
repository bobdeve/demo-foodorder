const express = require('express'); // Import Express framework
const cors = require('cors'); // Import CORS middleware
require('dotenv').config();  // Add this line to load environment variables
const { connectionToDb, getDb } = require('./db'); // Import database connection functions
const { ObjectId } = require('mongodb'); // Import ObjectId for MongoDB


const app = express(); // Create an Express application
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse incoming JSON requests
const stripeKey = process.env.STRIPE_SECRET // creating connnection with .env for stripe key
const stripe = require('stripe')(stripeKey);


let db; // Variable to hold the database instance

const init = async () => {
    try {
        await connectionToDb(); // Establish connection to the database
        db = getDb(); // Get the database instance

        console.log('Connected to the database'); // Log successful connection

        // GET route to fetch a sample of foods from the 'foods' collection
        app.get('/foods', async (req, res) => {
            try {
                const food = await db.collection('foods')
                    .find()
                    .limit(30) // Limit to 30 foods for demonstration
                    .toArray(); // Convert cursor to array

                return res.status(200).json(food); // Respond with the food array
            } catch (err) {
                console.error('Error fetching foods:', err); // Log error
                return res.status(500).json({ error: 'Could not fetch the foods' }); // Respond with error
            }
        });
        // GET route to fetch a sample of foods from the 'foods' collection
        app.get('/history', async (req, res) => {
            try {
                const food = await db.collection('userData')
                    .find()
                    .limit(30) // Limit to 30 foods for demonstration
                    .toArray(); // Convert cursor to array

                return res.status(200).json(food); // Respond with the food array
            } catch (err) {
                console.error('Error fetching foods:', err); // Log error
                return res.status(500).json({ error: 'Could not fetch the foods' }); // Respond with error
            }
        });

        // GET route to fetch a food item by ID
        app.get('/foods/:id', async (req, res) => {
            const id = req.params.id; // Get ID from request parameters

            // Validate ObjectId format
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'Invalid ID format' }); // Respond with error for invalid ID
            }

            const objectId = new ObjectId(id); // Instantiate ObjectId

            try {
                const food = await db.collection('foods').findOne({ _id: objectId }); // Fetch food by ID

                if (!food) {
                    return res.status(404).json({ error: 'Food item not found' }); // Handle not found
                }
                return res.status(200).json(food); // Respond with the food item
            } catch (err) {
                console.error('Error getting food:', err); // Log error
                return res.status(500).json({ error: 'Error getting food' }); // Respond with error
            }
        });

        app.post('/foods', async (req, res) => {
            const food = req.body;

            // // Validate the incoming data (you can add more validation based on your schema)
            // if (!food.name) {
            //     return res.status(400).json({ error: 'Name and price are required' });
            // }

            try {
                const result = await db.collection('userData').insertOne(food);
                res.status(201).json({ message: 'Food item created', foodId: result.insertedId }); // Send back the inserted ID
            } catch (err) {
                console.error('Error inserting food:', err);
                res.status(500).json({ error: 'Failed to create food item' });
            }
        });



        // Endpoint to handle POST requests for creating a checkout session
        app.post("/create-checkout-session", async (req, res) => {
            // Destructure 'items' array from request body
            const { items } = req.body;

           

            // Map 'items' array to create line items for Stripe checkout session
            const lineItems = items.map((item) => ({
                // Define price data for each item
                price_data: {
                    currency: "usd",                    // Currency code (USD in this case)
                    product_data: {
                        name: item.name,                // Product name from client
                        images: [item.image],           // Array of product images from client
                    },
                    unit_amount: Math.round(parseFloat(item.price) * 100), // Unit amount in cents (convert price to cents)
                },
                quantity: item.quantity,                // Quantity of the item
            }));

            try {
                // Create a checkout session with Stripe API
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],      // Payment method types accepted (only card in this case)
                    line_items: lineItems,               // Line items to be purchased in the session
                    mode: 'payment',                    // Mode of the session (payment for one-time payment)
                    success_url: `https://66ffba11fe8a2d0008d310fe--restaurant-food-ordering-app.netlify.app/success`, // Success URL (redirect after successful payment)
                    cancel_url: `http://localhost:3000/cancel`,   // Cancel URL (redirect if payment is canceled)
                });

                // Send session ID back to client as JSON response
                res.json({ id: session.id });
            } catch (err) {
                // Handle errors during session creation
                console.error('Error creating checkout session:', err);
                // Send 500 status and error details back to client
                res.status(500).json({ error: 'Failed to create checkout session', details: err.message });
            }
        });


        // Start the server on port 3000
        app.listen(3000, () => {
            console.log('App listening on port 3000'); // Log server start
        });
    } catch (err) {
        console.error('Failed to connect to the database:', err); // Log connection error
    }
};

init(); // Initialize the application