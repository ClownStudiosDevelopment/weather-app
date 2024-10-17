const apiKey = 'bd5e378503939ddaee76f12ad7a97608';
const countryInput = document.getElementById('countryInput');
const stateInput = document.getElementById('stateInput');
const cityInput = document.getElementById('cityInput');
const getWeatherBtn = document.getElementById('getWeatherBtn');
const unitSelect = document.getElementById('unitSelect');
const weatherResult = document.getElementById('weatherResult');
const locationList = document.getElementById('locationList');

window.onload = function () {
    const savedLocations = JSON.parse(localStorage.getItem('savedLocations')) || [];
    savedLocations.forEach(location => {
        addLocationToList(location);
    });

    const savedUnit = localStorage.getItem('temperatureUnit') || 'metric';
    unitSelect.value = savedUnit;
};

getWeatherBtn.addEventListener('click', () => {
    const country = countryInput.value;
    const state = stateInput.value;
    const city = cityInput.value;

    if (!city || !country) {
        weatherResult.textContent = 'Please enter at least a country and a city!';
        weatherResult.style.display = 'none';
        return;
    }

    const location = `${city}, ${state ? state + ', ' : ''}${country}`;
    fetchWeather(location);
});

async function fetchWeather(location) {
    const unit = unitSelect.value;
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=${unit}`);
    const data = await response.json();

    if (data.cod === '404') {
        weatherResult.textContent = 'Location not found!';
        weatherResult.style.display = 'none';
        return;
    }

    const { main, weather, wind, sys } = data;
    const tempDescription = getTemperatureDescription(main.temp);
    weatherResult.innerHTML = `
        <h2>${data.name}, ${sys.country}</h2>
        <p>Temperature: ${main.temp}°${unit === 'metric' ? 'C' : 'F'}</p>
        <p>Condition: ${weather[0].description} (${tempDescription})</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Pressure: ${main.pressure} hPa</p>
        <p>Wind Speed: ${wind.speed} m/s</p>
        <p>Sunrise: ${new Date(sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        <p>Sunset: ${new Date(sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
    `;

    weatherResult.style.display = 'block';
    saveLocation(location);
    localStorage.setItem('temperatureUnit', unit);
}

function getTemperatureDescription(temp) {
    if (temp < 10) return 'Cold';
    if (temp < 20) return 'Mild';
    return 'Warm';
}

function saveLocation(location) {
    const savedLocations = JSON.parse(localStorage.getItem('savedLocations')) || [];
    if (!savedLocations.includes(location)) {
        savedLocations.push(location);
        localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
        addLocationToList(location);
    }
}

function addLocationToList(location) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.textContent = location;
    button.classList.add('saved-location');
    button.onclick = () => fetchWeather(location);
    
    const deleteButton = document.createElement('span');
    deleteButton.textContent = ' ✖';
    deleteButton.classList.add('delete-location');
    deleteButton.onclick = () => deleteLocation(location, li);
    
    li.appendChild(button);
    li.appendChild(deleteButton);
    locationList.appendChild(li);
}

function deleteLocation(location, li) {
    let savedLocations = JSON.parse(localStorage.getItem('savedLocations')) || [];
    savedLocations = savedLocations.filter(loc => loc !== location);
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
    locationList.removeChild(li);
}
