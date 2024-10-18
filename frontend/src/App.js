import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [weatherData, setWeatherData] = useState([]);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    const response = await axios.get('http://localhost:5000/fetch-weather');
    setWeatherData(response.data);
  };

  return (
    <div className="App">
      <h1>Weather Monitoring System</h1>
      <table>
        <thead>
          <tr>
            <th>City</th>
            <th>Temperature (°C)</th>
            <th>Condition</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {weatherData.map((cityWeather, index) => (
            <tr key={index}>
              <td>{cityWeather.city}</td>
              <td>{cityWeather.temp}</td>
              <td>{cityWeather.condition}</td>
              <td>{new Date(cityWeather.timestamp * 1000).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
