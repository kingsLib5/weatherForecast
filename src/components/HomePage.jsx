import React, { useState } from 'react';
import axios from 'axios';
import ReactAnimatedWeather from 'react-animated-weather';
import Autosuggest from 'react-autosuggest';

const weatherIcons = {
  Clear: 'CLEAR_DAY',
  Clouds: 'CLOUDY',
  Rain: 'RAIN',
  Snow: 'SNOW',
  Drizzle: 'SLEET',
  Thunderstorm: 'WIND',
};

const HomePage = () => {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [isCelsius, setIsCelsius] = useState(true);
  const apiKey = '9e289b09c0a98c7dc0a04b5ceb0d54d0';

  // Fetch weather suggestions (replace with actual API for city suggestions if needed)
  const getSuggestions = async (value) => {
    const cities = ['Lagos', 'London', 'Los Angeles', 'Lisbon', 'Lima']; // Replace this with actual API call for suggestions
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    return inputLength === 0 ? [] : cities.filter(city => city.toLowerCase().includes(inputValue));
  };

  const onSuggestionsFetchRequested = async ({ value }) => {
    const fetchedSuggestions = await getSuggestions(value);
    setSuggestions(fetchedSuggestions);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) => suggestion;

  const renderSuggestion = (suggestion) => (
    <div className="suggestion-item px-4 py-2 hover:bg-blue-100 cursor-pointer">
      {suggestion}
    </div>
  );

  const fetchWeatherData = async (cityName) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`
      );
      setWeatherData(response.data);
  
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`
      );
      setForecastData(forecastResponse.data.list.slice(0, 5));
    } catch (error) {
      if (error.response) {
        console.error('Error fetching weather data:', error.response.data.message);
        alert(`Error fetching weather data: ${error.response.data.message}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        alert('Failed to fetch data. Please check your internet connection.');
      } else {
        console.error('Error in request setup:', error.message);
        alert('An unexpected error occurred.');
      }
    }
  };
  

  const handleToggle = () => setIsCelsius(!isCelsius);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchWeatherData(city);
    }
  };

  const handleButtonClick = () => {
    fetchWeatherData(city);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${weatherData ? 'bg-gradient-to-r from-blue-500 to-gray-800' : 'bg-blue-500'}`}>
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Weather Forecast</h1>

        {/* Search bar with autosuggest */}
        <div className="relative">
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
            onSuggestionsClearRequested={onSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={{
              placeholder: 'Enter city name',
              value: city,
              onChange: (e, { newValue }) => setCity(newValue),
              onKeyPress: handleKeyPress, // Detect Enter key press
            }}
            theme={{
              input: 'w-full p-4 text-lg border rounded-lg outline-none',
              suggestionsContainer: 'absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10',
              suggestion: 'suggestion-item text-lg py-2 px-4 cursor-pointer',
              suggestionHighlighted: 'bg-blue-100',
            }}
          />
        </div>

        {/* Gap between input and button */}
        <div className="mt-4">
          <button
            onClick={handleButtonClick}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Get Weather
          </button>
        </div>

        {/* Temperature Toggle */}
        <div className="flex justify-between items-center mt-6">
          <span className="text-xl">°C / °F</span>
          <button
            onClick={handleToggle}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-300"
          >
            {isCelsius ? 'Switch to Fahrenheit' : 'Switch to Celsius'}
          </button>
        </div>

        {/* Weather Data */}
        {weatherData && (
          <div className="text-center mt-6">
            <h2 className="text-2xl font-bold mb-2">{weatherData.name}</h2>
            <ReactAnimatedWeather
              icon={weatherIcons[weatherData.weather[0].main] || 'PARTLY_CLOUDY_DAY'}
              color={weatherData.weather[0].main === 'Clear' ? 'yellow' : weatherData.weather[0].main === 'Rain' ? 'blue' : 'gray'}
              size={64}
              animate={true}
            />
            <p className="text-xl mt-2">{weatherData.main.temp}°{isCelsius ? 'C' : 'F'}</p>
            <p>{weatherData.weather[0].description}</p>
            <p>Humidity: {weatherData.main.humidity}%</p>
            <p>Wind Speed: {weatherData.wind.speed} m/s</p>
          </div>
        )}

        {/* Forecast */}
        {forecastData.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold">5-Day Forecast</h3>
            <div className="grid grid-cols-5 gap-2 mt-4">
              {forecastData.map((day, index) => (
                <div key={index} className="p-4 bg-white rounded-lg shadow-lg text-center">
                  <ReactAnimatedWeather
                    icon={weatherIcons[day.weather[0].main] || 'PARTLY_CLOUDY_DAY'}
                    color={day.weather[0].main === 'Clear' ? 'yellow' : day.weather[0].main === 'Rain' ? 'blue' : 'gray'}
                    size={48}
                    animate={true}
                  />
                  <p className="mt-2">{Math.round(day.main.temp)}°{isCelsius ? 'C' : 'F'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
