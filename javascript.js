
const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const weatherCard = document.querySelector(".card");
const cityName = document.querySelector(".cityName").value;


async function checkWeather(cityName) {
    try {
        const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${cityName}?unitGroup=metric&key=P3BPWX6G9ESRZ6TV76DVUY6WA&contentType=json`);

        if (!response.ok) { 
            document.querySelector(".error").style.display = "block";
            document.querySelector(".weather").style.display = "none";
            return;
        }

        const data = await response.json();

        document.querySelector(".city").innerHTML = data.address; 
        document.querySelector(".temp").innerHTML = Math.round(data.currentConditions.temp) + "°C";
        document.querySelector(".humidity").innerHTML = data.currentConditions.humidity + "%";
        document.querySelector(".wind").innerHTML = data.currentConditions.windspeed + " km/h";

       
        if (data.currentConditions.conditions.includes("Cloud")) {
            weatherIcon.src = "images/clouds.png";
        } else if (data.currentConditions.conditions.includes("Clear")) {
            weatherIcon.src = "images/clear.png";
        } else if (data.currentConditions.conditions.includes("Rain")) {
            weatherIcon.src = "images/rain.png";
        } else if (data.currentConditions.conditions.includes("Drizzle")) {
            weatherIcon.src = "images/drizzle.png";
        } else if (data.currentConditions.conditions.includes("Mist")) {
            weatherIcon.src = "images/mist.png";
        }
        console.log(data.days[0].hours[0].uvindex)

        if(data.days[0].hours[0].uvindex <= 1){
            weatherCard.style.background = "linear-gradient(135deg, #33015c, #010b66)"
        }

        document.querySelector(".weather").style.display = "block";
        document.querySelector(".error").style.display = "none";

    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
});
searchBox.addEventListener("keydown", (event) => {
    if(event.key === 'Enter')
        checkWeather(searchBox.value);
   
});