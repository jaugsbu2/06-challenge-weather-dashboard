console.log("start")
var todayContainerEl = document.querySelector('#todayContainer');
var futureContainerEl = document.querySelector('#futureContainer');
var cityInputEl = document.querySelector('#city')
var cityformEl = document.querySelector('#city-form')
var cityheaderEl = document.querySelector('#city-header')
var citiesDivEl = document.querySelector('#cities')
var cities = []
var savedCities = []


var rendercities = function () {

  if (localStorage.getItem("cities") != null) {
    console.log('rendering cities')
    
    var searchHistoryEl = document.createElement('h2')
    searchHistoryEl.textContent = 'Select a City';
    citiesDivEl.appendChild(searchHistoryEl)
    cities = JSON.parse(localStorage.getItem("cities"));
    for (var i = 0; i < cities.length; i++) {
      var cityNameEl = document.createElement('button')
      cityNameEl.textContent = cities[i].name;
      cityNameEl.setAttribute('city', cities[i].name)
      citiesDivEl.appendChild(cityNameEl)
    }
    for (i = 0; i < cities.length; i++) {
      var cityName = cities[i].name
      savedCities.push(cityName);
    }
  }
  else {
    return
  }
}

var removeCities = function () {

    while (citiesDivEl.firstChild) {
      citiesDivEl.removeChild(citiesDivEl.firstChild)
    }

    savedCities = []
    cities = []
    rendercities()
}

var removeWeather = function () {
    while (todayContainerEl.firstChild) {
      todayContainerEl.removeChild(todayContainerEl.firstChild)
    }
    while (futureContainerEl.firstChild) {
      futureContainerEl.removeChild(futureContainerEl.firstChild)
    }
}

var formSubmitHandler = function (event) {
  event.preventDefault();

  var city = cityInputEl.value.trim();

  if (city.includes(',')) {
    alert('Please enter a city name only')
    cityInputEl.value = '';
  }
  else if (city.includes(' ')) {
    alert('Please enter a city name only without spaces or commas')
    cityInputEl.value = '';
  }
  else if (city) {
    var cityLc = city.toLowerCase();
    if (savedCities.includes(cityLc)) {
      var index = savedCities.indexOf(cityLc);
      console.log(index)
      var lat = cities[index].latitude
      var lon = cities[index].Longitude
      removeWeather()
      getWeather(lat, lon)
    }
    else {
      console.log('not saved city')
      removeWeather()
      getCoordinates(city);

    }
    cityInputEl.value = '';
  }

  else {
    alert('Please enter a city name');
  }
};

var buttonClickHandler = function(event) {
var city = event.target.getAttribute('city');
if (city) {
  if (savedCities.includes(city)) {
    var index = savedCities.indexOf(city);
    console.log(index)
    var lat = cities[index].latitude
    var lon = cities[index].Longitude
    removeWeather()
    getWeather(lat, lon)
  }
}
}

var getCoordinates = function (city) {
  var apiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=1&appid=e13ba5f8bf833f93245d6a975e33cb8f'

  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          if (data[0]) {
            var cityLc = city.toLowerCase();
            var lat = data[0].lat;
            var lon = data[0].lon;

            var cityObj = {
              name: cityLc,
              latitude: lat,
              Longitude: lon
            }
            cities.push(cityObj);
            localStorage.setItem('cities', JSON.stringify(cities));
            savedCities = []
            cities = []
            removeCities()
            getWeather(lat, lon)
          }
          else {
            alert('No City found')
          }
        });
      }
      else {
        alert('Error: ' + response.statusText);
      }
    })
    .catch(function (error) {
      alert('Unable to connect to Open Weather API');
    });
};

var getWeather = function (lat, lon) {

  var apiUrl = 'http://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&units=imperial&appid=e13ba5f8bf833f93245d6a975e33cb8f'

  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          renderWeathertoday(data);
          renderWeatherfuture(data)
        });
      } else {
        alert('Error: ' + response.statusText);
      }
    })
    .catch(function (error) {
      alert('Unable to connect to Open Weather API');
    });
};

var renderWeathertoday = function (data) {
  var cityName = data.city.name
  var cityCountry = data.city.country
  var cityInfoEl = document.createElement('h2')
  var tempInfoEl = document.createElement('p')
  var windInfoEl = document.createElement('p')
  var humInfoEl = document.createElement('p')
  var iconImgEl = document.createElement('img')
  var iconDesc = data.list[0].weather[0].icon;
  var iconUrl = 'http://openweathermap.org/img/wn/' + iconDesc + '@2x.png'

  iconImgEl.setAttribute('src', iconUrl)

  cityInfoEl.textContent = 'Current weather for ' + cityName + ', ' + cityCountry;
  tempInfoEl.textContent = 'Temperature: ' + data.list[0].main.temp + ' F';
  windInfoEl.textContent = 'Wind: ' + data.list[0].wind.speed + ' mph';
  humInfoEl.textContent = 'Humidity: ' + data.list[0].main.humidity + ' %';
  todayContainerEl.appendChild(cityInfoEl)
  todayContainerEl.appendChild(iconImgEl)
  todayContainerEl.appendChild(tempInfoEl)
  todayContainerEl.appendChild(windInfoEl)
  todayContainerEl.appendChild(humInfoEl)
  todayContainerEl.setAttribute('class', "weather")
}

var renderWeatherfuture = function (data) {

  for (i = 7; i < 40; i += 8) {

    var weatherdivEl = document.createElement('div')
    var dateEl = document.createElement('h3')
    var tempInfoEl = document.createElement('p')
    var windInfoEl = document.createElement('p')
    var humInfoEl = document.createElement('p')
    var iconImgEl = document.createElement('img')
    var iconDesc = data.list[i].weather[0].icon;
    var iconUrl = 'http://openweathermap.org/img/wn/' + iconDesc + '@2x.png'

    iconImgEl.setAttribute('src', iconUrl)

    tempInfoEl.textContent = 'Temperature: ' + data.list[i].main.temp + ' F';
    windInfoEl.textContent = 'Wind: ' + data.list[i].wind.speed + ' mph';
    humInfoEl.textContent = 'Humidity: ' + data.list[i].main.humidity + ' %';

    dateEl.textContent = data.list[i].dt_txt

    weatherdivEl.appendChild(dateEl)
    weatherdivEl.appendChild(iconImgEl)
    weatherdivEl.appendChild(tempInfoEl)
    weatherdivEl.appendChild(windInfoEl)
    weatherdivEl.appendChild(humInfoEl)
    weatherdivEl.setAttribute('class', "weatherfuture")
    futureContainerEl.appendChild(weatherdivEl)
  }
}

rendercities()
cityformEl.addEventListener('submit', formSubmitHandler);
citiesDivEl.addEventListener('click', buttonClickHandler);


