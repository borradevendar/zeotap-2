const mongoose = require('mongoose');

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

module.exports = Weather;
