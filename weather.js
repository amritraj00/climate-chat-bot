// Weather and climate data handling

// Weather API configuration - Replace with your API key
const WEATHER_API_KEY = '03d1a5668aa59af0252ec04cf2299ca4';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0/reverse';

// Fetch current weather data
async function fetchWeatherData(lat, lon) {
    try {
        // First, get the location name
        const locationResponse = await fetch(
            `${GEO_API_URL}?lat=${lat}&lon=${lon}&limit=1&appid=${WEATHER_API_KEY}`
        );
        const locationData = await locationResponse.json();
        
        // Then get the weather data
        const weatherResponse = await fetch(
            `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
        );
        const weatherData = await weatherResponse.json();
        
        // Update UI with weather data
        updateWeatherUI(weatherData, locationData[0]);
        
        return {
            weatherData,
            locationData: locationData[0]
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        displayWeatherError();
    }
}

// Fetch weather for a specific city (for chatbot queries)
async function fetchWeatherForCity(cityName) {
    try {
        const response = await fetch(
            `${WEATHER_API_URL}?q=${cityName}&units=metric&appid=${WEATHER_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const weatherData = await response.json();
        return weatherData;
    } catch (error) {
        console.error('Error fetching city weather:', error);
        throw error;
    }
}

// Fetch climate data (simulated)
async function fetchClimateData(lat, lon) {
    try {
        // This is a simulated API call since we don't have a real climate API
        // In a real app, you would call a proper climate data API
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate some random climate data for demonstration
        const climateData = {
            monthlyTemperature: {
                average: (Math.random() * 5 + 20).toFixed(1),
                trend: (Math.random() * 2 - 0.5).toFixed(1),
                percentChange: Math.floor(Math.random() * 70 + 30)
            },
            precipitation: {
                average: Math.floor(Math.random() * 100) + 20,
                trend: (Math.random() * 20 - 10).toFixed(1),
                percentChange: Math.floor(Math.random() * 80 + 20)
            },
            summary: [
                "Temperatures show slight warming trend compared to historical averages.",
                "Precipitation patterns indicate seasonal shifts with earlier spring rainfall.",
                "Climate indicators suggest typical seasonal patterns with minor variations."
            ][Math.floor(Math.random() * 3)]
        };
        
        updateClimateUI(climateData);
        return climateData;
    } catch (error) {
        console.error('Error fetching climate data:', error);
        displayClimateError();
    }
}

// Update weather UI elements
function updateWeatherUI(weatherData, locationData) {
    document.getElementById('location').textContent = `${locationData.name}, ${locationData.country}`;
    document.getElementById('temperature').textContent = Math.round(weatherData.main.temp);
    document.getElementById('condition').textContent = weatherData.weather[0].description;
    document.getElementById('wind').textContent = `${weatherData.wind.speed} km/h`;
    document.getElementById('humidity').textContent = `${weatherData.main.humidity}%`;
    
    // Update weather icon
    const weatherIcon = document.getElementById('weather-icon');
    const iconCode = weatherData.weather[0].icon;
    const isDay = iconCode.includes('d');
    
    switch (weatherData.weather[0].main.toLowerCase()) {
        case 'clear':
            weatherIcon.innerHTML = isDay ? '<i class="fas fa-sun text-yellow-500"></i>' : '<i class="fas fa-moon text-blue-300"></i>';
            break;
        case 'clouds':
            weatherIcon.innerHTML = '<i class="fas fa-cloud text-gray-400"></i>';
            break;
        case 'rain':
        case 'drizzle':
            weatherIcon.innerHTML = '<i class="fas fa-cloud-rain text-blue-400"></i>';
            break;
        case 'thunderstorm':
            weatherIcon.innerHTML = '<i class="fas fa-bolt text-yellow-500"></i>';
            break;
        case 'snow':
            weatherIcon.innerHTML = '<i class="fas fa-snowflake text-blue-200"></i>';
            break;
        case 'mist':
        case 'fog':
        case 'haze':
            weatherIcon.innerHTML = '<i class="fas fa-smog text-gray-300"></i>';
            break;
        default:
            weatherIcon.innerHTML = '<i class="fas fa-cloud text-gray-400"></i>';
    }
    
    // Add animation class
    weatherIcon.classList.add('weather-icon-animate');
}

// Update climate UI elements
function updateClimateUI(climateData) {
    const monthlyTrend = document.getElementById('monthly-trend');
    const monthlyTrendBar = document.getElementById('monthly-trend-bar');
    const precipTrend = document.getElementById('precipitation-trend');
    const precipTrendBar = document.getElementById('precipitation-trend-bar');
    const climateSummary = document.getElementById('climate-summary');
    
    monthlyTrend.textContent = `${climateData.monthlyTemperature.average}°C (${climateData.monthlyTemperature.trend > 0 ? '+' : ''}${climateData.monthlyTemperature.trend}°C)`;
    monthlyTrendBar.style.width = `${climateData.monthlyTemperature.percentChange}%`;
    
    precipTrend.textContent = `${climateData.precipitation.average}mm (${climateData.precipitation.trend > 0 ? '+' : ''}${climateData.precipitation.trend}mm)`;
    precipTrendBar.style.width = `${climateData.precipitation.percentChange}%`;
    
    climateSummary.textContent = climateData.summary;
    
    // Change color based on trend
    if (climateData.monthlyTemperature.trend > 0.5) {
        monthlyTrendBar.classList.remove('bg-green-500');
        monthlyTrendBar.classList.add('bg-red-500');
    } else if (climateData.monthlyTemperature.trend < -0.5) {
        monthlyTrendBar.classList.remove('bg-green-500');
        monthlyTrendBar.classList.add('bg-blue-500');
    }
}

// Create a weather card for the chatbot
function createWeatherCard(weatherData) {
    const iconCode = weatherData.weather[0].icon;
    const isDay = iconCode.includes('d');
    
    let iconHTML = '';
    switch (weatherData.weather[0].main.toLowerCase()) {
        case 'clear':
            iconHTML = isDay ? '<i class="fas fa-sun text-yellow-500 text-3xl"></i>' : '<i class="fas fa-moon text-blue-300 text-3xl"></i>';
            break;
        case 'clouds':
            iconHTML = '<i class="fas fa-cloud text-gray-400 text-3xl"></i>';
            break;
        case 'rain':
        case 'drizzle':
            iconHTML = '<i class="fas fa-cloud-rain text-blue-400 text-3xl"></i>';
            break;
        case 'thunderstorm':
            iconHTML = '<i class="fas fa-bolt text-yellow-500 text-3xl"></i>';
            break;
        case 'snow':
            iconHTML = '<i class="fas fa-snowflake text-blue-200 text-3xl"></i>';
            break;
        default:
            iconHTML = '<i class="fas fa-cloud text-gray-400 text-3xl"></i>';
    }
    
    return `
        <div class="weather-card bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
                <h3 class="font-semibold text-blue-700">Weather in ${weatherData.name}, ${weatherData.sys.country}</h3>
                ${iconHTML}
            </div>
            
            <div class="flex items-end mb-3">
                <span class="text-3xl font-bold text-gray-800">${Math.round(weatherData.main.temp)}</span>
                <span class="ml-1 text-gray-600">°C</span>
            </div>
            
            <p class="text-gray-700 mb-3">${weatherData.weather[0].description}</p>
            
            <div class="grid grid-cols-2 gap-2 text-sm">
                <div class="flex items-center">
                    <i class="fas fa-wind text-blue-400 mr-2"></i>
                    <span>Wind: ${weatherData.wind.speed} km/h</span>
                </div>
                <div class="flex items-center">
                    <i class="fas fa-tint text-blue-400 mr-2"></i>
                    <span>Humidity: ${weatherData.main.humidity}%</span>
                </div>
                <div class="flex items-center">
                    <i class="fas fa-temperature-high text-orange-400 mr-2"></i>
                    <span>High: ${Math.round(weatherData.main.temp_max)}°C</span>
                </div>
                <div class="flex items-center">
                    <i class="fas fa-temperature-low text-blue-400 mr-2"></i>
                    <span>Low: ${Math.round(weatherData.main.temp_min)}°C</span>
                </div>
            </div>
        </div>
    `;
}

// Display error if weather data can't be loaded
function displayWeatherError() {
    document.getElementById('location').textContent = 'Location unavailable';
    document.getElementById('temperature').textContent = '--';
    document.getElementById('condition').textContent = 'Weather data unavailable';
    document.getElementById('wind').textContent = '-- km/h';
    document.getElementById('humidity').textContent = '--%';
    document.getElementById('weather-icon').innerHTML = '<i class="fas fa-exclamation-circle text-red-400"></i>';
}

// Display error if climate data can't be loaded
function displayClimateError() {
    document.getElementById('monthly-trend').textContent = 'Data unavailable';
    document.getElementById('precipitation-trend').textContent = 'Data unavailable';
    document.getElementById('climate-summary').textContent = 'Climate data could not be loaded. Please try again later.';
}