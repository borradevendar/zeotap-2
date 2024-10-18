const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors()); // Allow cross-origin requests

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the schema for weather data
const weatherSchema = new mongoose.Schema({
  city: String,
  date: Date,
  avgTemp: Number,
  maxTemp: Number,
  minTemp: Number,
  dominantCondition: String,
  alerts: [String],
});

const Weather = mongoose.model('Weather', weatherSchema);

// OpenWeatherMap API key and cities
const apiKey = process.env.OWM_API_KEY;
const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

// Fetch weather data from OpenWeatherMap
app.get('/fetch-weather', async (req, res) => {
  try {
    let weatherData = [];
    for (const city of cities) {
      const response = await axios.get(
        `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      const weather = response.data;
      weatherData.push({
        city,
        temp: weather.main.temp,
        condition: weather.weather[0].main,
        timestamp: weather.dt,
      });
    }
    res.status(200).json(weatherData);
  } catch (error) {
    res.status(500).send("Error fetching weather data");
  }
});

// Store daily weather summaries
app.post('/store-weather', async (req, res) => {
  const { city, date, avgTemp, maxTemp, minTemp, dominantCondition } = req.body;
  const newWeather = new Weather({ city, date, avgTemp, maxTemp, minTemp, dominantCondition });
  await newWeather.save();
  res.status(200).send("Weather data saved");
});

// Check for alerts
app.post('/check-alerts', async (req, res) => {
  const { city, temp } = req.body;
  const threshold = 35; // Example threshold
  let alertMessage = '';

  if (temp > threshold) {
    alertMessage = `Alert! Temperature in ${city} exceeds ${threshold}°C!`;
    console.log(alertMessage);
  }

  res.status(200).send(alertMessage || 'No alerts');
});

// Port setup
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
