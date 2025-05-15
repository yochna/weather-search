import './style.css'; 
const cityInput = document.getElementById("city");
        const btn = document.getElementById("btn");
        const locationBtn = document.getElementById("location-btn");
        const clearBtn = document.getElementById("clear-btn");
        const weatherInfo = document.getElementById("weather-info");
        const cityList = document.getElementById("city-list");
        
      
        const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
        const MAX_RECENT_CITIES = 5;
        
       
        let savedCities = JSON.parse(localStorage.getItem("weather-cities")) || [];
        let useCelsius = true;
        let currentWeatherData = null;
        
        
        renderSavedCities();
        if (savedCities.length > 0) {
            getWeather(savedCities[0]);
            cityInput.value = savedCities[0];
        }
        
      
        btn.addEventListener("click", handleSearch);
        locationBtn.addEventListener("click", handleLocation);
        clearBtn.addEventListener("click", clearRecentSearches);
        cityInput.addEventListener("keyup", (e) => e.key === "Enter" && handleSearch());
        
        
        async function handleSearch() {
            const city = cityInput.value.trim();
            if (!city) {
                showError("Please enter a city name");
                return;
            }
            
            btn.disabled = true;
            btn.innerHTML = `
                <svg class="spinner" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
            `;
            
            await getWeather(city);
            
            btn.disabled = false;
            btn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
            `;
        }
        
        async function handleLocation() {
            if (!navigator.geolocation) {
                showError("Geolocation is not supported by your browser");
                return;
            }
            
            locationBtn.disabled = true;
            locationBtn.innerHTML = `
                <svg class="spinner" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
            `;
            
            weatherInfo.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Detecting your location...</p>
                </div>
            `;
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const data = await fetchWeatherByCoords(latitude, longitude);
                        currentWeatherData = data;
                        displayWeather(data);
                        saveCity(data.name);
                        cityInput.value = data.name;
                    } catch (error) {
                        showError(error.message);
                    } finally {
                        locationBtn.disabled = false;
                        locationBtn.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                            </svg>
                        `;
                    }
                },
                (error) => {
                    showError(`Location access denied: ${error.message}`);
                    locationBtn.disabled = false;
                    locationBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                        </svg>
                    `;
                }
            );
        }
        
        async function getWeather(city) {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
            
            weatherInfo.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Loading weather data...</p>
                </div>
            `;
            
            try {
                const res = await fetch(url);
                
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
                }
                
                const data = await res.json();
                currentWeatherData = data;
                displayWeather(data);
                saveCity(city);
            } catch (error) {
                showError(error.message.includes("404") ? 
                    "City not found. Please check the spelling." : 
                    error.message);
            }
        }
        
        async function fetchWeatherByCoords(lat, lon) {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
            const res = await fetch(url);
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
            }
            
            return await res.json();
        }
        
        function displayWeather(data) {
            const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
            const temp = useCelsius ? data.main.temp : (data.main.temp * 9/5 + 32).toFixed(1);
            const feelsLike = useCelsius ? data.main.feels_like : (data.main.feels_like * 9/5 + 32).toFixed(1);
            const unit = useCelsius ? "°C" : "°F";
            
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const dateString = now.toLocaleDateString('en-US', options);
            
            weatherInfo.innerHTML = `
                <div class="current-weather">
                    <div class="location">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                        </svg>
                        ${escapeHtml(data.name)}, ${data.sys.country}
                    </div>
                    <div class="date">${dateString}</div>
                    <img src="${iconUrl}" alt="${escapeHtml(data.weather[0].description)}" class="weather-icon">
                    <div class="temperature">
                        ${temp}<span class="unit-toggle" id="unit-toggle">${unit}</span>
                    </div>
                    <div class="description">${escapeHtml(data.weather[0].description)}</div>
                    <div class="feels-like">Feels like ${feelsLike}${unit}</div>
                </div>
                
                <div class="weather-details">
                    <div class="detail-card">
                        <div class="detail-icon">💧</div>
                        <div class="detail-value">${data.main.humidity}%</div>
                        <div class="detail-label">Humidity</div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-icon">💨</div>
                        <div class="detail-value">${data.wind.speed} m/s</div>
                        <div class="detail-label">Wind</div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-icon">📊</div>
                        <div class="detail-value">${data.main.pressure} hPa</div>
                        <div class="detail-label">Pressure</div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-icon">👀</div>
                        <div class="detail-value">${(data.visibility / 1000).toFixed(1)} km</div>
                        <div class="detail-label">Visibility</div>
                    </div>
                </div>
                
                <div class="forecast-container" id="forecast-container">
                    <!-- Forecast will be loaded here -->
                </div>
            `;
            
            setWeatherBackground(data.weather[0].id);
            document.getElementById("unit-toggle").addEventListener("click", toggleUnit);
            
           
            loadForecast(data.coord.lat, data.coord.lon);
        }
        
        async function loadForecast(lat, lon) {
            try {
                const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
                const res = await fetch(url);
                
                if (!res.ok) {
                    throw new Error("Failed to load forecast data");
                }
                
                const data = await res.json();
                displayForecast(data);
            } catch (error) {
                console.error("Forecast error:", error);
              
            }
        }
        
        function displayForecast(data) {
            const forecastContainer = document.getElementById("forecast-container");
            if (!forecastContainer) return;
            
          
            const dailyForecast = {};
            data.list.forEach(item => {
                const date = new Date(item.dt * 1000).toLocaleDateString();
                if (!dailyForecast[date]) {
                    dailyForecast[date] = item;
                }
            });
            
          
            const forecastDays = Object.values(dailyForecast).slice(1, 6);
            
            forecastContainer.innerHTML = `
                <h3 class="forecast-title">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                    </svg>
                    5-Day Forecast
                </h3>
                <div class="forecast-items">
                    ${forecastDays.map(day => {
                        const date = new Date(day.dt * 1000);
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                        const temp = useCelsius ? day.main.temp : (day.main.temp * 9/5 + 32).toFixed(0);
                        const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
                        
                        return `
                            <div class="forecast-item">
                                <div class="forecast-day">${dayName}</div>
                                <img src="${iconUrl}" alt="${day.weather[0].description}" class="forecast-icon">
                                <div class="forecast-temp">${temp}${useCelsius ? '°C' : '°F'}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
        
        function setWeatherBackground(weatherId) {
            const body = document.body;
            body.className = 'default-bg';
            
            if (weatherId >= 200 && weatherId < 300) {
                body.classList.add('thunderstorm-bg');
            } else if (weatherId >= 300 && weatherId < 500) {
                body.classList.add('drizzle-bg');
            } else if (weatherId >= 500 && weatherId < 600) {
                body.classList.add('rain-bg');
            } else if (weatherId >= 600 && weatherId < 700) {
                body.classList.add('snow-bg');
            } else if (weatherId === 800) {
                body.classList.add('clear-bg');
            } else if (weatherId > 800) {
                body.classList.add('clouds-bg');
            } else if (weatherId >= 700 && weatherId < 800) {
                body.classList.add('mist-bg');
            }
        }
        
        function toggleUnit() {
            useCelsius = !useCelsius;
            if (currentWeatherData) {
                displayWeather(currentWeatherData);
            }
        }
        
        function saveCity(city) {
            city = city.trim();
            if (!city) return;
            
          
            savedCities = savedCities.filter(c => c.toLowerCase() !== city.toLowerCase());
            
           
            savedCities.unshift(city);
            
           
            if (savedCities.length > MAX_RECENT_CITIES) {
                savedCities.pop();
            }
            
            localStorage.setItem("weather-cities", JSON.stringify(savedCities));
            renderSavedCities();
        }
        
        function clearRecentSearches() {
            savedCities = [];
            localStorage.removeItem("weather-cities");
            renderSavedCities();
        }
        
        function renderSavedCities() {
            cityList.innerHTML = savedCities.map(city => 
                `<div class="city-chip" onclick="getWeather('${escapeHtml(city)}')">${escapeHtml(city)}</div>`
            ).join("");
        }
        
        function showError(message) {
            weatherInfo.innerHTML = `
                <div class="error-message">
                    ${escapeHtml(message)}
                </div>
            `;
        }
        
        function escapeHtml(unsafe) {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }