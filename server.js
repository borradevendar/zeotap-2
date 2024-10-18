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
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define the schema for daily weather summary
const dailyWeatherSchema = new mongoose.Schema({
  city: String,
  date: Date,
  avgTemp: Number,
  maxTemp: Number,
  minTemp: Number,
  dominantCondition: String, // Dominant weather condition (e.g., Rain, Clear)
  alerts: [String], // Store any alerts
});

const DailyWeather = mongoose.model('DailyWeather', dailyWeatherSchema);

// OpenWeatherMap API key and cities
const apiKey = process.env.OWM_API_KEY;
const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

// Helper function to fetch weather data and store summaries
const fetchWeatherData = async () => {
  try {
    for (const city of cities) {
      const response = await axios.get(
        `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
      );
      const dailyData = response.data.list;
      const date = new Date(dailyData[0].dt * 1000).toDateString(); // Get the date from the data

      // Rollup weather data for the day
      let totalTemp = 0, maxTemp = -Infinity, minTemp = Infinity, conditionCount = {};
      dailyData.forEach((weather) => {
        const temp = weather.main.temp;
        totalTemp += temp;
        maxTemp = Math.max(maxTemp, weather.main.temp_max);
        minTemp = Math.min(minTemp, weather.main.temp_min);

        // Count occurrences of weather conditions (e.g., Rain, Clear)
        const condition = weather.weather[0].main;
        if (!conditionCount[condition]) {
          conditionCount[condition] = 0;
        }
        conditionCount[condition]++;
      });

      // Determine the dominant weather condition
      const dominantCondition = Object.keys(conditionCount).reduce((a, b) =>
        conditionCount[a] > conditionCount[b] ? a : b
      );

      // Calculate the average temperature for the day
      const avgTemp = totalTemp / dailyData.length;

      // Store the rolled-up daily summary in the database
      const newDailyWeather = new DailyWeather({
        city,
        date,
        avgTemp,
        maxTemp,
        minTemp,
        dominantCondition,
        alerts: [], // Alerts will be added separately
      });

      await newDailyWeather.save()
      .then(() => console.log(`Weather data for ${city} on ${date} saved with dominant condition: ${dominantCondition}`))
  .catch((err) => console.error('Error saving weather data:', err));
      console.log(`Weather data for ${city} on ${date} saved with dominant condition: ${dominantCondition}`);
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
};

// Endpoint to manually trigger weather data fetching and storage
app.get('/fetch-weather', async (req, res) => {
  try {
    await fetchWeatherData();
    res.status(200).send("Weather data fetched and stored successfully");
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).send("Failed to fetch and store weather data");
  }
});

// Endpoint to retrieve stored weather data
app.get('/get-weather', async (req, res) => {
  try {
    const weatherData = await DailyWeather.find().sort({ date: -1 }).limit(100); // Get recent data
    res.json(weatherData); // Return weather data to the client
  } catch (error) {
    console.error("Error retrieving weather data:", error);
    res.status(500).send("Failed to retrieve weather data");
  }
});

// Schedule the fetchWeatherData function to run every 5 minutes
setInterval(fetchWeatherData, 5 * 60 * 1000);

// Port setup
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
