import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [weatherData, setWeatherData] = useState([]); // Initialize with an empty array
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track error state

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true); // Set loading to true before making the request
        const response = await axios.get('http://localhost:5000/get-weather'); // Update to new endpoint
        console.log('Weather data from API:', response.data); // Log the API response
  
        const data = response.data; // Assuming API returns an array of weather data
        if (Array.isArray(data)) {
          setWeatherData(data); // Set weatherData if it's an array
        } else {
          console.log('Unexpected data format', data);
          setWeatherData([]); // Handle unexpected data formats gracefully
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setError('Error fetching weather data.'); // Set error message
      } finally {
        setLoading(false); // Stop loading once data is fetched or error occurs
      }
    };
  
    fetchWeatherData();
  }, []);
  

  // Debug log for weatherData to confirm it's being updated
  useEffect(() => {
    console.log('Weather data state:', weatherData);
  }, [weatherData]);

  // Render weather data, loading state, or error message
  return (
    <div className="App">
      <h1>Weather Data</h1>

      {loading && <p>Loading weather data...</p>} {/* Display loading message */}

      {error && <p>{error}</p>} {/* Display error message if there's any */}

      {weatherData.length > 0 ? (
        weatherData.map((data, index) => (
          <div key={index} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <p><strong>City:</strong> {data.city}</p>
            <p><strong>Date:</strong> {data.date}</p>
            <p><strong>Avg Temp:</strong> {data.avgTemp}°C</p>
            <p><strong>Max Temp:</strong> {data.maxTemp}°C</p>
            <p><strong>Min Temp:</strong> {data.minTemp}°C</p>
            <p><strong>Dominant Condition:</strong> {data.dominantCondition}</p>
          </div>
        ))
      ) : (
        !loading && !error && <p>No weather data available</p> // Display when data is empty
      )}
    </div>
  );
}

export default App;
