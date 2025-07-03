// --- DOM Element Selection ---
const searchBox = document.querySelector(".search input.cityName");
const searchBtn = document.querySelector(".search button");
const body = document.body;
const cloudsContainer = document.querySelector('.clouds-bg');
const rainContainer = document.querySelector('.rain-bg');
const loader = document.querySelector('.loader');

// Main weather display
const weatherDisplay = document.querySelector(".weather-main .weather");
const tempElement = document.querySelector(".temp");
const cityElement = document.querySelector(".city");
const dateTimeElement = document.querySelector(".date-time");
const weatherIcon = document.querySelector(".weather-icon");

// Details panel
const detailsList = document.querySelector(".details-list");
const feelsLikeElement = document.querySelector(".feels-like");
const humidityElement = document.querySelector(".humidity");
const windElement = document.querySelector(".wind");
const uvIndexElement = document.querySelector(".uv-index");
const visibilityElement = document.querySelector(".visibility");
const sunriseElement = document.querySelector(".sunrise");
const sunsetElement = document.querySelector(".sunset");

// Forecast panel
const forecastSection = document.querySelector(".forecast-list");
const forecastListContainer = document.querySelector(".forecast-list ul");

const errorContainer = document.querySelector(".error");

// --- Configuration ---
// IMPORTANT: Your API key from Visual Crossing
// 1. Get your own free API key from https://www.visualcrossing.com/weather-api
// NOTE: Do not commit your real API key to a public repository.
const apiKey = "P3BPWX6G9ESRZ6TV76DVUY6WA";
const apiHost = "https://weather.visualcrossing.com";

// Map API icons to our local image files
const iconMap = {
    'partly-cloudy-day': 'images/clouds.png',
    'partly-cloudy-night': 'images/clouds.png',
    'cloudy': 'images/clouds.png',
    'clear-day': 'images/clear.png',
    'clear-night': 'images/clear.png', // Could have a moon icon
    'rain': 'images/rain.png',
    'snow': 'images/snow.png',
    'wind': 'images/wind.png',
    'fog': 'images/mist.png'
};

// --- Core Functions ---

/**
 * Fetches and displays weather data for a given city.
 * @param {string} location The name of the city, "lat,lon", or "auto".
 */
async function checkWeather(location) {
    // Add a check to ensure the API key has been set.
    if (apiKey === "YOUR_API_KEY_HERE" || !apiKey) {
        showError("API key is missing. Please add it to javascript.js");
        loader.style.display = 'none';
        return;
    }

    // 1. Set up loading state
    weatherDisplay.classList.remove("visible");
    detailsList.classList.remove("visible");
    forecastSection.classList.remove("visible");
    hideError();
    loader.style.display = 'flex';

    let loadingText = `Fetching weather for ${location}...`;
    if (location === 'auto') {
        loadingText = "Fetching weather for your location...";
    } else if (location.includes(',')) {
        loadingText = "Fetching weather for your current coordinates...";
    }
    loader.querySelector('p').textContent = loadingText;

    const apiUrl = `${apiHost}/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=metric&key=${apiKey}&contentType=json`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            showError(`Location not found. Please try another.`);
            return;
        }

        const data = await response.json();
        updateWeatherUI(data);

    } catch (error) {
        console.error("Error fetching weather data:", error);
        showError("Unable to connect. Check your network.");
    } finally {
        // 3. Hide loader regardless of outcome
        loader.style.display = 'none';
    }
}

/**
 * Updates the entire UI with the fetched weather data.
 * @param {object} data The weather data object from the API.
 */
function updateWeatherUI(data) {
    const { currentConditions } = data;

    // Update main display
    tempElement.innerHTML = `${Math.round(currentConditions.temp)}°`;
    cityElement.innerHTML = data.resolvedAddress.split(',')[0]; // Show just the city name
    dateTimeElement.innerHTML = formatDateTime(currentConditions.datetimeEpoch);
    
    // Update details panel
    feelsLikeElement.innerHTML = `${Math.round(currentConditions.feelslike)}°`;
    humidityElement.innerHTML = `${currentConditions.humidity}%`;
    windElement.innerHTML = `${currentConditions.windspeed} km/h`;
    uvIndexElement.innerHTML = currentConditions.uvindex;
    visibilityElement.innerHTML = `${currentConditions.visibility} km`;
    sunriseElement.innerHTML = formatTime(currentConditions.sunriseEpoch);
    sunsetElement.innerHTML = formatTime(currentConditions.sunsetEpoch);

    // Update icon and background
    updateAppearance(currentConditions);

    // Update the 5-day forecast
    updateForecastUI(data.days);

    // 2. Show the weather info
    body.classList.add('weather-active');
    weatherDisplay.classList.add("visible");
    detailsList.classList.add("visible");
    forecastSection.classList.add("visible");
}

/**
 * Updates the background, icon, and star effect based on weather.
 * @param {object} conditions The currentConditions object from the API.
 */
function updateAppearance(conditions) {
    // Reset background effects
    cloudsContainer.classList.remove("visible");
    rainContainer.classList.remove("visible");

    const conditionIcon = conditions.icon; // e.g., "partly-cloudy-day", "clear-night", "rain"

    // Set dynamic background effects
    if (cloudsContainer && conditionIcon.includes('cloudy')) {
        cloudsContainer.classList.add('visible');
    }
    if (rainContainer && conditionIcon.includes('rain')) {
        rainContainer.classList.add('visible');
    }

    // Use a default if the specific icon isn't in our map
    weatherIcon.src = iconMap[conditionIcon] || 'images/clear.png';
}

/**
 * Formats a UNIX epoch timestamp into a human-readable string.
 * @param {number} epochSeconds The timestamp in seconds.
 * @returns {string} The formatted date and time string.
 */
function formatDateTime(epochSeconds) {
    const date = new Date(epochSeconds * 1000);
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'short' };

    const timeStr = new Intl.DateTimeFormat('en-US', timeOptions).format(date);
    const dateStr = new Intl.DateTimeFormat('en-US', dateOptions).format(date);

    // Manually construct to get "06:09 - Monday, 1 Sep" format
    return `${timeStr} - ${dateStr}`;
}

/**
 * Formats a UNIX epoch timestamp into a HH:MM string.
 * @param {number} epochSeconds The timestamp in seconds.
 * @returns {string} The formatted time string (e.g., "06:30").
 */
function formatTime(epochSeconds) {
    const date = new Date(epochSeconds * 1000);
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Populates the 5-day forecast section.
 * @param {Array} days The array of forecast days from the API.
 */
function updateForecastUI(days) {
    if (!forecastListContainer) return;

    // Clear previous forecast
    forecastListContainer.innerHTML = '';

    // Loop through the next 5 days (skip today, which is index 0)
    for (let i = 1; i < 6 && i < days.length; i++) {
        const day = days[i];

        const dayName = new Date(day.datetimeEpoch * 1000).toLocaleDateString('en-US', { weekday: 'short' });
        const iconSrc = iconMap[day.icon] || 'images/clear.png';
        const highTemp = `${Math.round(day.tempmax)}°`;
        const lowTemp = `${Math.round(day.tempmin)}°`;

        const forecastItemHTML = `
            <li>
                <span class="day-name">${dayName}</span>
                <img src="${iconSrc}" alt="${day.conditions}" class="forecast-icon">
                <span class="day-temp">${highTemp} / ${lowTemp}</span>
            </li>
        `;

        forecastListContainer.insertAdjacentHTML('beforeend', forecastItemHTML);
    }
}
/**
 * Shows an error message.
 * @param {string} message The error message to display.
 */
function showError(message) {
    errorContainer.querySelector('p').textContent = message;
    errorContainer.style.display = "block";
    weatherDisplay.classList.remove("visible");
    detailsList.classList.remove("visible");
    forecastSection.classList.remove("visible");
}

/**
 * Hides the error message.
 */
function hideError() {
    errorContainer.style.display = "none";
}

/**
 * Sets the day/night theme based on the user's local time.
 * This determines the main background image and star visibility.
 */
function setInitialTheme() {
    const currentHour = new Date().getHours();
    // Consider night time from 6 PM (18:00) to 6 AM (05:59)
    if (currentHour >= 18 || currentHour < 6) {
        body.classList.add('night');
    } else {
        body.classList.remove('night');
    }
}

/**
 * Tries to get user's location via Geolocation API,
 * falling back to IP-based lookup.
 */
function getInitialWeather() {
    // Get weather based on user's IP address.
    // This avoids the need for a browser permission prompt.
    checkWeather('auto');
}

/**
 * Creates the star elements for the background effect.
 * This should only run once on page load.
 */
function initializeStars(count) {
    const starsContainer = document.querySelector('.stars');
    if (!starsContainer) return;

    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        star.style.animationDuration = `${Math.random() * 2 + 1.5}s`;
        starsContainer.appendChild(star);
    }
}

// --- Event Listeners ---
searchBtn.closest('form').addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent page reload
    if (searchBox.value) checkWeather(searchBox.value.trim());
});

// --- Initial Load ---
setInitialTheme(); // Set theme based on user's local time
initializeStars(150); // Create stars once when the page loads.
getInitialWeather(); // Get weather for user's location on start.