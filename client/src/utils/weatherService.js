// 서울 좌표 (위치 권한 거부 시 기본값)
const DEFAULT_COORDS = { lat: 37.5665, lon: 126.978 };

// localStorage 캐시 키
const CACHE_KEY = 'golden-days-weather';

// 캐시 유효 시간: 3시간
const CACHE_TTL = 3 * 60 * 60 * 1000;

/**
 * OpenWeatherMap 날씨 코드를 4가지 분류로 변환합니다.
 * https://openweathermap.org/weather-conditions
 */
const classifyWeather = (weatherId) => {
  if (weatherId >= 200 && weatherId < 600) return 'rain';
  if (weatherId >= 600 && weatherId < 700) return 'snow';
  if (weatherId >= 700 && weatherId < 800) return 'cloudy';
  if (weatherId === 800) return 'sunny';
  if (weatherId > 800) return 'cloudy';
  return 'cloudy';
};

/**
 * 사용자 위치를 가져옵니다.
 * 거부/실패 시 서울 좌표 반환.
 */
const getUserCoords = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_COORDS);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(DEFAULT_COORDS),
      { timeout: 5000, maximumAge: 3600000 }
    );
  });
};

/**
 * localStorage 캐시를 확인합니다.
 */
const getCachedWeather = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const cached = JSON.parse(raw);
    const now = Date.now();

    if (now - cached.timestamp > CACHE_TTL) return null;

    // 날짜가 바뀌었으면 캐시 무효화
    const cachedDate = new Date(cached.timestamp).toDateString();
    const todayDate = new Date().toDateString();
    if (cachedDate !== todayDate) return null;

    return cached.data;
  } catch {
    return null;
  }
};

const setCachedWeather = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data,
    }));
  } catch {
    // localStorage 용량 초과 등 — 무시
  }
};

/**
 * 현재 날씨를 가져옵니다.
 * 오프라인/에러 시 null 반환 (배너 숨김).
 */
export const fetchCurrentWeather = async () => {
  const cached = getCachedWeather();
  if (cached) return cached;

  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  if (!apiKey) return null;

  try {
    const coords = await getUserCoords();

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric&lang=kr`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const json = await response.json();
    const weatherId = json.weather?.[0]?.id;
    if (!weatherId) return null;

    const result = {
      weather: classifyWeather(weatherId),
      temp: Math.round(json.main?.temp ?? 0),
      description: json.weather[0]?.description || '',
      city: json.name || '서울',
    };

    setCachedWeather(result);
    return result;
  } catch {
    return null;
  }
};

/**
 * 날씨 분류에 해당하는 콘텐츠를 필터링합니다.
 */
export const getWeatherContent = (weatherType, weatherContentPool) => {
  return weatherContentPool.filter(item => item.weather === weatherType);
};

/**
 * 날씨별 메타데이터 (아이콘, 라벨, 색상)
 */
export const WEATHER_META = {
  sunny:  { icon: '☀️', label: '맑은 날', color: '#F59E0B' },
  cloudy: { icon: '☁️', label: '흐린 날', color: '#94A3B8' },
  rain:   { icon: '🌧️', label: '비 오는 날', color: '#3B82F6' },
  snow:   { icon: '❄️', label: '눈 오는 날', color: '#93C5FD' },
};
