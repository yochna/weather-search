(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))a(t);new MutationObserver(t=>{for(const n of t)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function s(t){const n={};return t.integrity&&(n.integrity=t.integrity),t.referrerPolicy&&(n.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?n.credentials="include":t.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(t){if(t.ep)return;t.ep=!0;const n=s(t);fetch(t.href,n)}})();const f=document.getElementById("city"),v=document.getElementById("btn"),c=document.getElementById("location-btn"),x=document.getElementById("clear-btn"),m=document.getElementById("weather-info"),C=document.getElementById("city-list"),h="87f38f880a80c002ddeb5926a7028f19",M=5;let o=JSON.parse(localStorage.getItem("weather-cities"))||[],l=!0,g=null;y();o.length>0&&($(o[0]),f.value=o[0]);v.addEventListener("click",L);c.addEventListener("click",B);x.addEventListener("click",z);f.addEventListener("keyup",e=>e.key==="Enter"&&L());async function L(){const e=f.value.trim();if(!e){u("Please enter a city name");return}v.disabled=!0,v.innerHTML=`
                <svg class="spinner" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
            `,await $(e),v.disabled=!1,v.innerHTML=`
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
            `}async function B(){if(!navigator.geolocation){u("Geolocation is not supported by your browser");return}c.disabled=!0,c.innerHTML=`
                <svg class="spinner" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
            `,m.innerHTML=`
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Detecting your location...</p>
                </div>
            `,navigator.geolocation.getCurrentPosition(async e=>{try{const{latitude:i,longitude:s}=e.coords,a=await k(i,s);g=a,w(a),b(a.name),f.value=a.name}catch(i){u(i.message)}finally{c.disabled=!1,c.innerHTML=`
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                            </svg>
                        `}},e=>{u(`Location access denied: ${e.message}`),c.disabled=!1,c.innerHTML=`
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                        </svg>
                    `})}async function $(e){const i=`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(e)}&appid=${h}&units=metric`;m.innerHTML=`
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Loading weather data...</p>
                </div>
            `;try{const s=await fetch(i);if(!s.ok){const t=await s.json();throw new Error(t.message||`Error ${s.status}: ${s.statusText}`)}const a=await s.json();g=a,w(a),b(e)}catch(s){u(s.message.includes("404")?"City not found. Please check the spelling.":s.message)}}async function k(e,i){const s=`https://api.openweathermap.org/data/2.5/weather?lat=${e}&lon=${i}&appid=${h}&units=metric`,a=await fetch(s);if(!a.ok){const t=await a.json();throw new Error(t.message||`Error ${a.status}: ${a.statusText}`)}return await a.json()}function w(e){const i=`https://openweathermap.org/img/wn/${e.weather[0].icon}@4x.png`,s=l?e.main.temp:(e.main.temp*9/5+32).toFixed(1),a=l?e.main.feels_like:(e.main.feels_like*9/5+32).toFixed(1),t=l?"°C":"°F",n=new Date,r={weekday:"long",year:"numeric",month:"long",day:"numeric"},p=n.toLocaleDateString("en-US",r);m.innerHTML=`
                <div class="current-weather">
                    <div class="location">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                        </svg>
                        ${d(e.name)}, ${e.sys.country}
                    </div>
                    <div class="date">${p}</div>
                    <img src="${i}" alt="${d(e.weather[0].description)}" class="weather-icon">
                    <div class="temperature">
                        ${s}<span class="unit-toggle" id="unit-toggle">${t}</span>
                    </div>
                    <div class="description">${d(e.weather[0].description)}</div>
                    <div class="feels-like">Feels like ${a}${t}</div>
                </div>
                
                <div class="weather-details">
                    <div class="detail-card">
                        <div class="detail-icon">💧</div>
                        <div class="detail-value">${e.main.humidity}%</div>
                        <div class="detail-label">Humidity</div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-icon">💨</div>
                        <div class="detail-value">${e.wind.speed} m/s</div>
                        <div class="detail-label">Wind</div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-icon">📊</div>
                        <div class="detail-value">${e.main.pressure} hPa</div>
                        <div class="detail-label">Pressure</div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-icon">👀</div>
                        <div class="detail-value">${(e.visibility/1e3).toFixed(1)} km</div>
                        <div class="detail-label">Visibility</div>
                    </div>
                </div>
                
                <div class="forecast-container" id="forecast-container">
                    <!-- Forecast will be loaded here -->
                </div>
            `,H(e.weather[0].id),document.getElementById("unit-toggle").addEventListener("click",T),S(e.coord.lat,e.coord.lon)}async function S(e,i){try{const s=`https://api.openweathermap.org/data/2.5/forecast?lat=${e}&lon=${i}&appid=${h}&units=metric`,a=await fetch(s);if(!a.ok)throw new Error("Failed to load forecast data");const t=await a.json();F(t)}catch(s){console.error("Forecast error:",s)}}function F(e){const i=document.getElementById("forecast-container");if(!i)return;const s={};e.list.forEach(t=>{const n=new Date(t.dt*1e3).toLocaleDateString();s[n]||(s[n]=t)});const a=Object.values(s).slice(1,6);i.innerHTML=`
                <h3 class="forecast-title">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                    </svg>
                    5-Day Forecast
                </h3>
                <div class="forecast-items">
                    ${a.map(t=>{const r=new Date(t.dt*1e3).toLocaleDateString("en-US",{weekday:"short"}),p=l?t.main.temp:(t.main.temp*9/5+32).toFixed(0),E=`https://openweathermap.org/img/wn/${t.weather[0].icon}@2x.png`;return`
                            <div class="forecast-item">
                                <div class="forecast-day">${r}</div>
                                <img src="${E}" alt="${t.weather[0].description}" class="forecast-icon">
                                <div class="forecast-temp">${p}${l?"°C":"°F"}</div>
                            </div>
                        `}).join("")}
                </div>
            `}function H(e){const i=document.body;i.className="default-bg",e>=200&&e<300?i.classList.add("thunderstorm-bg"):e>=300&&e<500?i.classList.add("drizzle-bg"):e>=500&&e<600?i.classList.add("rain-bg"):e>=600&&e<700?i.classList.add("snow-bg"):e===800?i.classList.add("clear-bg"):e>800?i.classList.add("clouds-bg"):e>=700&&e<800&&i.classList.add("mist-bg")}function T(){l=!l,g&&w(g)}function b(e){e=e.trim(),e&&(o=o.filter(i=>i.toLowerCase()!==e.toLowerCase()),o.unshift(e),o.length>M&&o.pop(),localStorage.setItem("weather-cities",JSON.stringify(o)),y())}function z(){o=[],localStorage.removeItem("weather-cities"),y()}function y(){C.innerHTML=o.map(e=>`<div class="city-chip" onclick="getWeather('${d(e)}')">${d(e)}</div>`).join("")}function u(e){m.innerHTML=`
                <div class="error-message">
                    ${d(e)}
                </div>
            `}function d(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}
