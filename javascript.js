
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
        // console.log(data.days[0].hours[0].uvindex)
        console.log(data.currentConditions.uvindex + " uvindex")
        

        //Night:
        if(data.currentConditions.uvindex < 1){
            weatherCard.style.background = "linear-gradient(135deg, #33015c, #010b66)"
            nightStarsEffect();
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


//Animations:
function nightStarsEffect(){
    const card = document.querySelector('.card'); // or the body
const starsContainer = document.createElement('div');
starsContainer.classList.add('stars');
card.parentElement.insertBefore(starsContainer, card); // Insert before card

function createStars(numStars) {
  for (let i = 0; i < numStars; i++) {
    const star = document.createElement('div');
    star.classList.add('star');

    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 2 + 1; // Random size between 1px and 3px

    star.style.left = `${x}%`;
    star.style.top = `${y}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.animationDelay = `${Math.random() * 2}s`; // Random delay for twinkle

    starsContainer.appendChild(star);
  }
}

function createMeteor(numMeteor) {
    for (let i = 0; i < numMeteor; i++) {
        const meteor = document.createElement('div');
        meteor.classList.add('meteor');

        const x = Math.random() * 100;

        meteor.style.animationDelay = `${Math.random() * 5}s`; // Random delay for meteors.
        meteor.style.width = `${Math.random() * 100 + 50}px`; // random width between 50px and 150px
        meteor.style.left = `${x}%`;
        
        starsContainer.appendChild(meteor);
    }
}

createStars(100); // You can change the number of stars here
createMeteor(3) // You can change the number of meteors here

}