# Dynamic Weather App

A clean and simple weather application that displays the current weather and a 5-day forecast for any location. It features dynamic backgrounds that change based on the weather conditions and time of day.

---

## Features

- **Current Weather:** Displays temperature, feels like, humidity, wind speed, UV index, visibility, sunrise, and sunset times.
- **5-Day Forecast:** Shows a summary for the next five days, including high/low temperatures and weather icons.
- **Automatic Location Detection:** On first load, the app attempts to show weather for the user's current location.
- **Manual Search:** Users can search for any city or location worldwide.
- **Dynamic UI:**
  - The background and theme change between day and night.
  - Animated backgrounds for cloudy and rainy conditions.
  - Animated stars for the night theme.
- **Loading & Error States:** Provides clear feedback to the user while fetching data or if an error occurs.

## Setup and Installation

To run this project locally, follow these simple steps:

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    ```

2.  **Get a free API Key:**
    This project uses the Visual Crossing Weather API. You will need to get your own free API key to make it work.
    - Go to [https://www.visualcrossing.com/weather-api](https://www.visualcrossing.com/weather-api)
    - Sign up for a free account.
    - Get your API key from your account page.

3.  **Add the API Key to the project:**
    - Open the `javascript.js` file.
    - Find the `apiKey` constant on line 45.
    - Replace the placeholder string with your actual API key.
    ```javascript  

    const apiKey = "YOUR_REAL_API_KEY";
    
    ```
    > **Note:** It's important not to commit your real API key to a public repository.

4.  **Run the application:**
    - Simply open the `index.html` file in your favorite web browser.

   ## Contributions are welcome


