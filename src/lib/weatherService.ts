export interface WeatherCondition {
  main: string; // e.g., "Clear", "Clouds", "Rain", "Snow"
  description: string; // e.g., "clear sky", "light rain"
  temp: number;
  feelsLike: number;
  icon: string;
}

export interface WeatherSuggestion {
  item: string;
  reason: string;
}

// Free OpenWeatherMap API - users can sign up for their own key
const WEATHER_API_KEY = 'demo'; // Replace with actual key or use env variable

export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherCondition | null> {
  try {
    // For demo purposes, return mock data if API key is 'demo'
    if (WEATHER_API_KEY === 'demo') {
      return getMockWeather();
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      console.error('Weather API error:', response.statusText);
      return null;
    }

    const data = await response.json();
    
    return {
      main: data.weather[0].main,
      description: data.weather[0].description,
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      icon: data.weather[0].icon,
    };
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    return null;
  }
}

function getMockWeather(): WeatherCondition {
  // Cycle through different weather conditions for demo
  const conditions = [
    { main: 'Rain', description: 'light rain', temp: 18, feelsLike: 17, icon: '10d' },
    { main: 'Clouds', description: 'overcast clouds', temp: 15, feelsLike: 14, icon: '04d' },
    { main: 'Clear', description: 'clear sky', temp: 28, feelsLike: 30, icon: '01d' },
    { main: 'Snow', description: 'light snow', temp: -2, feelsLike: -5, icon: '13d' },
  ];
  
  const index = Math.floor(Date.now() / 60000) % conditions.length;
  return conditions[index];
}

export function getWeatherSuggestions(weather: WeatherCondition | null): WeatherSuggestion[] {
  if (!weather) return [];

  const suggestions: WeatherSuggestion[] = [];
  const temp = weather.temp;
  const condition = weather.main.toLowerCase();

  // Rain/Storm conditions
  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm')) {
    suggestions.push({ item: '☔ Umbrella', reason: 'Rainy weather' });
    suggestions.push({ item: '🧥 Rain jacket', reason: 'Stay dry' });
  }

  // Snow conditions
  if (condition.includes('snow')) {
    suggestions.push({ item: '🧤 Gloves', reason: 'Snowy weather' });
    suggestions.push({ item: '🧣 Scarf', reason: 'Keep warm' });
    suggestions.push({ item: '🧥 Winter coat', reason: 'Cold weather' });
  }

  // Cold weather (below 10°C)
  if (temp < 10) {
    if (!suggestions.some(s => s.item.includes('Gloves'))) {
      suggestions.push({ item: '🧤 Gloves', reason: `Cold: ${temp}°C` });
    }
    if (!suggestions.some(s => s.item.includes('coat'))) {
      suggestions.push({ item: '🧥 Warm jacket', reason: `Cold: ${temp}°C` });
    }
    suggestions.push({ item: '🧢 Warm cap', reason: `Cold: ${temp}°C` });
  }

  // Hot weather (above 25°C)
  if (temp > 25) {
    suggestions.push({ item: '😎 Sunglasses', reason: `Hot: ${temp}°C` });
    suggestions.push({ item: '💧 Extra water', reason: 'Stay hydrated' });
    suggestions.push({ item: '🧴 Sunscreen', reason: 'Protect skin' });
  }

  // Windy conditions
  if (condition.includes('wind')) {
    suggestions.push({ item: '🧢 Cap', reason: 'Windy weather' });
  }

  // Cloudy/overcast (but not raining)
  if (condition.includes('cloud') && !condition.includes('rain')) {
    if (temp < 20) {
      suggestions.push({ item: '🧥 Light jacket', reason: 'Cloudy & cool' });
    }
  }

  return suggestions;
}

export function getWeatherEmoji(weather: WeatherCondition | null): string {
  if (!weather) return '🌡️';
  
  const condition = weather.main.toLowerCase();
  
  if (condition.includes('clear')) return '☀️';
  if (condition.includes('cloud')) return '☁️';
  if (condition.includes('rain') || condition.includes('drizzle')) return '🌧️';
  if (condition.includes('thunderstorm')) return '⛈️';
  if (condition.includes('snow')) return '❄️';
  if (condition.includes('mist') || condition.includes('fog')) return '🌫️';
  
  return '🌡️';
}
