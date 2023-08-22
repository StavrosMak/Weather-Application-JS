let weather = {
  apiKey: "f883dd5b91b4be57660b80bc1041ced6",
  APIEndpoint: "https://api.openweathermap.org/data/2.5",

  // ! Function 1
  // get the lat & lot
  async getLatLon(city) {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&units=metric&appid=${this.apiKey}`
    );
    const coordinatesData = await response.json();
    const latitude = coordinatesData[0].lat;
    const longitude = coordinatesData[0].lon;
    return { latitude, longitude };
  },

  // ! Function 2
  // currect day - Weather data
  async fetchWeather(city) {
    try {
      // Get lat& log from city name
      const { latitude, longitude } = await this.getLatLon(city);
      const url = `${this.APIEndpoint}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${this.apiKey}`;
      const response = await fetch(url);
      const fetchWeatherdata = await response.json();

      //fetch weather.
      this.displayWeather(fetchWeatherdata);
    } catch (error) {
      document.querySelector(".searchInput").style.border =
        "1px solid rgba(255, 0, 0, 0.4)";
      const myInput = document.querySelector(".searchInput");
      myInput.value = "";

      myInput.setAttribute(
        "placeholder",
        "Invalid input. This city does not exist."
      );
    }
  },

  // ! Function 3
  //Display current info.
  displayWeather: function (data) {
    //Method
    const {
      name,
      weather: [{ main, description }], //data.weather[0]
      main: { temp, humidity, pressure, feels_like },
      wind: { speed, deg },
      timezone,
    } = data;

    // Calculate wind direction
    const windDirections = [
      "North",
      "North East",
      "East",
      "South East",
      "South",
      "South West",
      "West",
      "North West",
    ];

    const searchBar = document.querySelector(".searchInput");
    searchBar.style.border = "1px solid rgba(255, 255, 255, 0.1)";
    searchBar.setAttribute("placeholder", "Search...");

    const windDirection = windDirections[Math.round((deg % 360) / 45)];
    document.querySelector(
      ".city"
    ).innerHTML = `Weather in <style="text-transform: capitalize";>${searchBar.value}`; //We don't care specifically about the area where we got the data, but the general area so we display this name px florida..we dont care if data is from orlado.
    document.querySelector(
      ".humidity"
    ).innerHTML = `<span>Humidity:</span> ${humidity} %`;
    document.querySelector(".description").innerHTML = `${description}`;
    document.querySelector(
      ".direction"
    ).innerHTML = `<span>Direction:</span> ${windDirection}`;
    document.querySelector(
      ".pressure"
    ).innerHTML = `<span>Atmospheric Pressure:</span> ${pressure} hPa`;
    document.querySelector(
      ".feels_like"
    ).innerHTML = `<span>Feels Like:</span> ${feels_like} &degC`;
    document.querySelector(
      ".speed"
    ).innerHTML = `<span>Speed:</span> ${speed} m/s`;
    document.querySelector(
      ".temp"
    ).innerHTML = `<span>Temperature:</span> ${temp} &degC`;


    const weatherImage = document.querySelector(".weatherImage");
    const weatherMappings = {
      Rain: 'rain',
      Clouds: 'clouds',
      Snow: 'snow',
      Thunderstorm: 'thunderstorm',
      Drizzle: 'rain',
      Atmosphere: 'snow',
      Clear: 'sun'
    };

    const mainValue = main;
    console.log(main);
    const mainWeather = weatherMappings[mainValue];

    if (mainWeather) {
      weatherImage.innerHTML = `<img src="./images/svg/${mainWeather}.svg" alt="${mainWeather} SVG">`;
    } else {
      weatherImage.innerHTML = "No matching weather image found";
    }

  },

  // ! Function 4
  // full week forecast
  fetchData: async function (city) {
    try {
      const { latitude, longitude } = await this.getLatLon(city);
      const url = `${this.APIEndpoint}/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=f883dd5b91b4be57660b80bc1041ced6`;
      const response = await fetch(url);
      const data = await response.json();
      const dailyForecasts = {}; //object keeps min & max

      data.list.forEach((forecast) => {
        //for each element/forecast
        const {
          dt_txt,
          main: { temp_min, temp_max },
          weather,
        } = forecast; 

        const date = dt_txt.split(" ")[0]; 

        /* If you remove this if statement, the code will overwrite any existing values for dailyForecasts[date] instead of adding to them.So if exists then find max and then overwrite.Else create the object. */
        if (!dailyForecasts[date]) {
          // checks if object with this date DOES NOT exists.

          dailyForecasts[date] = {
            minTemp: forecast.main.temp_min, //assign min
            maxTemp: forecast.main.temp_max, //assign max
            Temp: forecast.main.temp, //assign max
          };

        } else {
          dailyForecasts[date].minTemp = Math.min(
            dailyForecasts[date].minTemp,
            forecast.main.temp_min
          );
          dailyForecasts[date].maxTemp = Math.max(
            dailyForecasts[date].maxTemp,
            forecast.main.temp_max
          );
        }
        dailyForecasts[date].icon = forecast.weather[0].icon;
      });

      const weeklyForecast = document.querySelector(".weeklyForecast");
      const forecastContainer = document.querySelector(".forecastContainer");
      forecastContainer.innerHTML = "";
      // add the new data -- create DayCard
      for (const date in dailyForecasts) {
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.toLocaleDateString("en-US", {
          weekday: "long",
        });

        const { maxTemp, icon, temp } = dailyForecasts[date];

        const dayCard = createDayCard(dayOfWeek, maxTemp, icon);

        forecastContainer.appendChild(dayCard);
      }
    
      weeklyForecast.append(forecastContainer);
    } catch (error) {
      console.log("Problem found-Error:", error);
    }
  },
};

// !Create DayCard
function createDayCard(dayOfWeek, maxTemp, icon) {
  const dayCard = document.createElement("div");
  dayCard.classList.add("dayCard");
  const h3 = document.createElement("h3");
  const p = document.createElement("p");

  h3.textContent = `${dayOfWeek}:`;
  p.innerHTML = `Max Temp:${maxTemp}&degC`;

  const Icon = icon.slice(0, -1);
   dayCard.appendChild(h3);
   switch (Icon) {
    case "01":
      dayCard.innerHTML = '<img src="./images/svg/sun.svg" alt="Sun SVG">';
      break;
    case "02"://2 or 3 or 4 is the same case
    case "03":
    case "04":
      dayCard.innerHTML = '<img src="./images/svg/clouds.svg" alt="Clouds SVG">';
      break;
    case "09":
    case "10":
      dayCard.innerHTML = '<img src="./images/svg/rain.svg" alt="Rain SVG">';
      break;
    case "11":
      dayCard.innerHTML = '<img src="./images/svg/thunderstorm.svg" alt="Thunderstorm SVG">';
      break;
    case "13":
      dayCard.innerHTML = '<img src="./images/svg/snow.svg" alt="Snow SVG">';
      break;
    default:
       console.error('Icon does not found');
      break;
  }
  dayCard.appendChild(p);
  return dayCard;
}

// !EventListeners.
document.querySelector(".searchBtn").addEventListener("click", () => {
  weather.fetchWeather(document.querySelector(".searchInput").value);
  weather.fetchData(document.querySelector(".searchInput").value);

  document.querySelector(".weatherContainer").classList.add("open");
  const image = document.querySelector('#image');
  image.classList.add('fade');
});

document.querySelector(".searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    weather.fetchWeather(document.querySelector(".searchInput").value);
    weather.fetchData(document.querySelector(".searchInput").value);
    document.querySelector(".weatherContainer").classList.add("open");
  }
});
