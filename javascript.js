// --- DOM Element Selection ---
const searchBox = document.querySelector(".search input.cityName");
const searchBtn = document.querySelector(".search button");
const body = document.body;
const cloudsContainer = document.querySelector(".clouds-bg");
const rainContainer = document.querySelector(".rain-bg");
const loader = document.querySelector(".loader");

// Main weather display:items that show weather details
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
// --- State Management ---
let isInitialLoad = true;

const iconMap = {
  "partly-cloudy-day": "images/clouds.png",
  "partly-cloudy-night": "images/clouds.png",
  cloudy: "images/clouds.png",
  "clear-day": "images/clear.png",
  "clear-night": "images/clear.png", // Could have a moon icon
  rain: "images/rain.png",
  snow: "images/snow.png",
  wind: "images/wind.png",
  fog: "images/mist.png",
};

// --- Core Functions ---

/**
 * Fetches and displays weather data for a given city.
 * @param {string} location The name of the city, "lat,lon", or "auto".
 * @param {string} [locationName] The display name for the location, to override API's resolvedAddress.
 */
async function checkWeather(location, locationName) {
  // Returns true on success, false on failure
  // Check for API key.
  if (apiKey === "YOUR_API_KEY_HERE" || !apiKey) {
    showError("API key is missing. Please add it to javascript.js");
    loader.style.display = "none";
    return false;
  }

  // 1. Set up loading state
  weatherDisplay.classList.remove("visible");
  detailsList.classList.remove("visible");
  forecastSection.classList.remove("visible");
  hideError();
  loader.style.display = "flex";

  let loadingText = `Fetching weather for ${locationName || location}...`;
  if (location === "auto") {
    loadingText = "Fetching weather for your location...";
  }
  loader.querySelector("p").textContent = loadingText;

  const apiUrl = `${apiHost}/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
    location
  )}?unitGroup=metric&key=${apiKey}&contentType=json`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      // The API returns plain text errors for non-200 responses.
      // This is crucial for debugging issues like an invalid API key.
      const errorText = await response.text();
      console.error("Visual Crossing API Error:", errorText);
      // Show a more specific error to the user.
      showError(`Could not fetch weather. Reason: ${errorText}`);
      return false;
    }

    const data = await response.json();
    updateWeatherUI(data, locationName);
    return true;
  } catch (error) {
    console.error("Fetch API Error:", error);

    if (isInitialLoad && error instanceof TypeError) {
      // On initial load, a network error is likely due to an ad-blocker.
      // Instead of a harsh error, we'll just invite the user to search manually.
      console.warn(
        "Initial weather fetch failed, likely due to a network block. The app is ready for manual search."
      );
      loader.querySelector("p").textContent =
        "Auto-detection failed. Please use the search bar.";
    } else {
      // For manual searches or other types of errors, show the full error message.
      let message = "Unable to connect. Please check your network.";
      if (error instanceof TypeError) {
        message =
          "Network request failed. This may be due to an ad-blocker, firewall, or a network issue.";
      }
      showError(message);
    }
    return false;
  } finally {
    // 3. Hide loader regardless of outcome
    loader.style.display = "none";
    isInitialLoad = false; // The first attempt is over.
  }
}

/**
 * Updates the entire UI with the fetched weather data.
 * @param {object} data The weather data object from the API.
 * @param {string} [locationName] The display name for the location.
 */
function updateWeatherUI(data, locationName) {
  const { currentConditions, timezone, resolvedAddress } = data;

  // Get the current date and time in the location's timezone.
  // The API's `currentConditions.datetime` is the observation time, not the real-time clock time.
  const now = new Date();
  const timeStr = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(now);
  const dateStr = formatDate(now.getTime() / 1000, timezone);

  // Update main display
  tempElement.innerHTML = `${Math.round(currentConditions.temp)}°`;
  // For simplicity, show the main city name from the resolved address.
  // This is cleaner but less specific than showing the full address.
  // e.g., shows "New York" instead of "New York, NY, United States".
  cityElement.innerHTML = locationName || resolvedAddress.split(",")[0];
  dateTimeElement.innerHTML = `${timeStr} - ${dateStr}`;

  // Update details panel
  feelsLikeElement.innerHTML = `${Math.round(currentConditions.feelslike)}°`;
  humidityElement.innerHTML = `${currentConditions.humidity}%`;
  windElement.innerHTML = `${currentConditions.windspeed} km/h`;
  uvIndexElement.innerHTML = currentConditions.uvindex;
  visibilityElement.innerHTML = `${currentConditions.visibility} km`;
  // Use pre-formatted time strings from API and slice to HH:MM
  sunriseElement.innerHTML = currentConditions.sunrise.slice(0, 5);
  sunsetElement.innerHTML = currentConditions.sunset.slice(0, 5);

  // Update icon and background
  updateAppearance(currentConditions);

  // Update the 5-day forecast
  updateForecastUI(data.days);

  // 2. Show the weather info
  body.classList.add("weather-active");
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

  // Set day/night theme based on API response (icon name)
  if (conditionIcon.includes("night")) {
    body.classList.add("night");
  } else {
    body.classList.remove("night");
  }

  // Set dynamic background effects
  if (cloudsContainer && conditionIcon.includes("cloudy")) {
    cloudsContainer.classList.add("visible");
  }
  if (rainContainer && conditionIcon.includes("rain")) {
    rainContainer.classList.add("visible");
  }

  // Use a default if the specific icon isn't in our map
  weatherIcon.src = iconMap[conditionIcon] || "images/clear.png";
}

/**
 * Formats a UNIX epoch timestamp into a human-readable date string for a specific timezone.
 * @param {number} epochSeconds The timestamp in seconds.
 * @param {string} timeZone The IANA timezone name (e.g., "America/New_York").
 * @returns {string} The formatted date string (e.g., "Monday, 1 Sep").
 */
function formatDate(epochSeconds, timeZone) {
  const date = new Date(epochSeconds * 1000);
  const dateOptions = {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone,
  };
  return new Intl.DateTimeFormat("en-US", dateOptions).format(date);
}

/**
 * Populates the 5-day forecast section.
 * @param {Array} days The array of forecast days from the API.
 */
function updateForecastUI(days) {
  if (!forecastListContainer) return;

  // Clear previous forecast
  forecastListContainer.innerHTML = "";

  // Loop through the next 5 days (skip today, which is index 0)
  for (let i = 1; i < 6 && i < days.length; i++) {
    const day = days[i];

    const dayName = new Date(day.datetimeEpoch * 1000).toLocaleDateString(
      "en-US",
      { weekday: "short" }
    );
    const iconSrc = iconMap[day.icon] || "images/clear.png";
    const highTemp = `${Math.round(day.tempmax)}°`;
    const lowTemp = `${Math.round(day.tempmin)}°`;

    const forecastItemHTML = `
            <li>
                <span class="day-name">${dayName}</span>
                <img src="${iconSrc}" alt="${day.conditions}" class="forecast-icon">
                <span class="day-temp">${highTemp} / ${lowTemp}</span>
            </li>
        `;

    forecastListContainer.insertAdjacentHTML("beforeend", forecastItemHTML);
  }
}
/**
 * Shows an error message.
 * @param {string} message The error message to display.
 */
function showError(message) {
  errorContainer.querySelector("p").textContent = message;
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
 * Sets the initial day/night theme based on the user's local time.
 * This determines the main background color before the first API call.
 */
function setInitialTheme() {
  const currentHour = new Date().getHours();
  // Consider night time from 6 PM (18:00) to 6 AM (05:59)
  if (currentHour >= 18 || currentHour < 6) {
    body.classList.add("night");
  } else {
    body.classList.remove("night");
  }
}

/**
 * Gets the user's approximate location by parsing their browser's timezone.
 * This is requested once on page load to show local weather.
 */
async function getInitialWeather() {
  try {
    // Intl.DateTimeFormat().resolvedOptions().timeZone gives the IANA timezone name (e.g., "America/New_York")
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log(`User's timezone is: ${userTimezone}`);

    const parts = userTimezone.split("/");
    // Take the last part of the timezone string (e.g., "Khartoum" from "Africa/Khartoum")
    const potentialCity = parts[parts.length - 1].replace(/_/g, " ");

    // Check if the extracted name is a reasonable city name and not something generic like 'UTC' or 'GMT'
    if (parts.length > 1 && potentialCity) {
      console.log(
        `Attempting to get weather for extracted city: "${potentialCity}"`
      );
      const success = await checkWeather(potentialCity);

      // If the extracted city name fails (e.g., it's not in the API's database), fall back to 'auto'
      if (!success) {
        console.warn(
          `Failed to get weather for "${potentialCity}". Falling back to 'auto' detection.`
        );
        hideError(); // Hide the previous error before retrying
        await checkWeather("auto");
      }
    } else {
      // If timezone is simple (e.g., "UTC"), use 'auto' directly.
      console.log(
        "Timezone is not in Region/City format. Using 'auto' detection."
      );
      await checkWeather("auto");
    }
  } catch (error) {
    // This might fail if Intl API is not supported, though it's highly unlikely in modern browsers.
    console.warn(
      "Could not determine timezone, falling back to weather API's 'auto' feature.",
      error
    );
    await checkWeather("auto");
  }
}

/**
 * Creates the star elements for the background effect.
 * This should only run once on page load.
 */
function initializeStars(count) {
  const starsContainer = document.querySelector(".stars");
  if (!starsContainer) return;

  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star";
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
searchBtn.closest("form").addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent page reload
  if (searchBox.value) {
    const city = searchBox.value.trim();
    localStorage.setItem("lastCity", city);
    checkWeather(city); // Only call once
  }
});

// --- Optional: Load from localStorage on page load ---
const lastCity = localStorage.getItem("lastCity");
if (lastCity) {
  checkWeather(lastCity);
}

// --- Initial Load ---
setInitialTheme(); // Set theme based on user's local time for the initial view.
initializeStars(150); // Create stars once when the page loads.
getInitialWeather(); // Get weather for user's location on start.
