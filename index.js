const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

const apiKey = process.env.API_KEY;

// Initialize an empty array to store the data
let coinData = [];

// Middleware for API Key Authentication
const authenticateAPIKey = (req, res, next) => {
    const providedApiKey = req.query.apiKey;
  
    if (!providedApiKey || providedApiKey !== apiKey) {
      return res.status(403).json({ error: 'Invalid API Key' });
    }
  
    // API key is valid, continue to the next middleware or route
    next();
};

// Function to fetch and store data
const fetchData = async () => {
  try {
    // Fetch data from CoinGecko API
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets',
      {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 100,
          page: 1,
          sparkline: false,
          locale: 'en',
        },
      }
    );

    // Update the local coinData array with the fetched data
    coinData = response.data;

    console.log('Data fetched and updated successfully.');
  } catch (error) {
    console.error('Error fetching and updating data:', error);
  }
};

// API Endpoint to Get Stored Data
app.get('/price-feed', authenticateAPIKey, (req, res) => {
  res.json(coinData);
});

// Schedule the data fetch and store operation every 10 minutes
cron.schedule('*/10 * * * *', fetchData);

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initial data fetch when the server starts
fetchData();