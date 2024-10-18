const mongoose = require('mongoose');

// Schema for daily weather summary
const dailyWeatherSchema = new mongoose.Schema({
  city: String,
  date: Date,
  avgTemp: Number,
  maxTemp: Number,
  minTemp: Number,
  dominantCondition: String, // Dominant weather condition
  alerts: [String], // Store any alerts
});

const DailyWeather = mongoose.model('DailyWeather', dailyWeatherSchema);

module.exports = DailyWeather;
