// База данных по загрязнению светом (World Atlas 2015 + актуальные измерения)
export const cityData = {
  "Москва": { bortle: 9, sqm: 17.8, lat: 55.7558, lon: 37.6173 },
  "Санкт-Петербург": { bortle: 9, sqm: 17.5, lat: 59.9311, lon: 30.3609 },
  "Новосибирск": { bortle: 8, sqm: 18.5, lat: 55.0084, lon: 82.9357 },
  "Екатеринбург": { bortle: 8, sqm: 18.4, lat: 56.8389, lon: 60.6057 },
  "Казань": { bortle: 8, sqm: 18.6, lat: 55.7964, lon: 49.1088 },
  "Нижний Новгород": { bortle: 8, sqm: 18.3, lat: 56.3269, lon: 44.0059 },
  "Челябинск": { bortle: 8, sqm: 18.4, lat: 55.1644, lon: 61.4368 },
  "Самара": { bortle: 8, sqm: 18.5, lat: 53.2028, lon: 50.1261 },
  "Омск": { bortle: 8, sqm: 18.6, lat: 54.9885, lon: 73.3242 },
  "Ростов-на-Дону": { bortle: 8, sqm: 18.2, lat: 47.2357, lon: 39.7015 },
  "Уфа": { bortle: 8, sqm: 18.5, lat: 54.7388, lon: 55.9721 },
  "Красноярск": { bortle: 8, sqm: 18.7, lat: 56.0153, lon: 92.8932 },
  "Воронеж": { bortle: 8, sqm: 18.3, lat: 51.6720, lon: 39.1843 },
  "Пермь": { bortle: 8, sqm: 18.6, lat: 58.0105, lon: 56.2502 },
  "Волгоград": { bortle: 8, sqm: 18.2, lat: 48.7080, lon: 44.5133 },
  "Краснодар": { bortle: 8, sqm: 18.4, lat: 45.0393, lon: 38.9872 },
  "Саратов": { bortle: 8, sqm: 18.4, lat: 51.5331, lon: 46.0342 },
  "Тюмень": { bortle: 7, sqm: 19.2, lat: 57.1613, lon: 65.5250 },
  "Тольятти": { bortle: 8, sqm: 18.5, lat: 53.5078, lon: 49.4204 },
  "Ижевск": { bortle: 8, sqm: 18.6, lat: 56.8527, lon: 53.2115 },
  "Барнаул": { bortle: 7, sqm: 19.3, lat: 53.3561, lon: 83.7646 },
  "Иркутск": { bortle: 7, sqm: 19.4, lat: 52.2870, lon: 104.2817 },
  "Хабаровск": { bortle: 7, sqm: 19.5, lat: 48.4814, lon: 135.0721 },
  "Ярославль": { bortle: 8, sqm: 18.5, lat: 57.6261, lon: 39.8845 },
  "Владивосток": { bortle: 7, sqm: 19.6, lat: 43.1155, lon: 131.8855 },
  "Махачкала": { bortle: 8, sqm: 18.3, lat: 42.9849, lon: 47.5046 },
  "Томск": { bortle: 7, sqm: 19.5, lat: 56.4846, lon: 84.9482 },
  "Оренбург": { bortle: 7, sqm: 19.2, lat: 51.7682, lon: 55.0970 },
  "Кемерово": { bortle: 7, sqm: 19.1, lat: 55.3590, lon: 86.0728 },
  "Новокузнецк": { bortle: 7, sqm: 19.0, lat: 53.7596, lon: 87.1212 },
  "Рязань": { bortle: 8, sqm: 18.4, lat: 54.6292, lon: 39.7363 },
  "Астрахань": { bortle: 8, sqm: 18.3, lat: 46.3476, lon: 48.0302 },
  "Набережные Челны": { bortle: 8, sqm: 18.5, lat: 55.7436, lon: 52.3958 },
  "Пенза": { bortle: 8, sqm: 18.5, lat: 53.1950, lon: 45.0183 },
  "Липецк": { bortle: 8, sqm: 18.4, lat: 52.6088, lon: 39.5992 },
  "Киров": { bortle: 7, sqm: 19.3, lat: 58.6035, lon: 49.6679 },
  "Чебоксары": { bortle: 8, sqm: 18.6, lat: 56.1431, lon: 47.2502 },
  "Тула": { bortle: 8, sqm: 18.3, lat: 54.1960, lon: 37.6182 },
  "Калининград": { bortle: 7, sqm: 19.4, lat: 54.7104, lon: 20.4522 },
  "Балашиха": { bortle: 9, sqm: 17.9, lat: 55.7963, lon: 37.9382 },
  "Ставрополь": { bortle: 7, sqm: 19.2, lat: 45.0445, lon: 41.9691 },
  "Сочи": { bortle: 7, sqm: 19.5, lat: 43.6028, lon: 39.7342 },
  "Улан-Удэ": { bortle: 7, sqm: 19.6, lat: 51.8348, lon: 107.5845 },
  "Курск": { bortle: 7, sqm: 19.2, lat: 51.7304, lon: 36.1926 },
  "Сургут": { bortle: 7, sqm: 19.4, lat: 61.2540, lon: 73.3962 },
  "Владимир": { bortle: 7, sqm: 19.1, lat: 56.1290, lon: 40.4070 },
  "Чита": { bortle: 6, sqm: 20.1, lat: 52.0340, lon: 113.5010 },
  "Симферополь": { bortle: 7, sqm: 19.0, lat: 44.9521, lon: 34.1024 },
  "Мурманск": { bortle: 6, sqm: 20.2, lat: 68.9585, lon: 33.0827 },
  "Вологда": { bortle: 7, sqm: 19.3, lat: 59.2181, lon: 39.8886 },
  "Архангельск": { bortle: 6, sqm: 20.0, lat: 64.5399, lon: 40.5187 },
  "Смоленск": { bortle: 7, sqm: 19.4, lat: 54.7867, lon: 31.8155 },
  "Калуга": { bortle: 7, sqm: 19.3, lat: 54.5142, lon: 36.2535 },
  "Белгород": { bortle: 7, sqm: 19.1, lat: 50.5957, lon: 36.5872 },
  "Череповец": { bortle: 7, sqm: 19.2, lat: 59.1226, lon: 37.9035 },
  "Владикавказ": { bortle: 7, sqm: 19.0, lat: 42.8200, lon: 44.6816 },
  "Нижний Тагил": { bortle: 7, sqm: 19.1, lat: 57.9072, lon: 59.9721 },
  "Волжский": { bortle: 7, sqm: 19.0, lat: 48.7858, lon: 44.7797 },
  "Саранск": { bortle: 7, sqm: 19.2, lat: 54.1874, lon: 45.1839 },
  "Тамбов": { bortle: 7, sqm: 19.3, lat: 52.7213, lon: 41.4523 },
  "Петрозаводск": { bortle: 6, sqm: 20.1, lat: 61.7850, lon: 34.3469 },
  "Кострома": { bortle: 7, sqm: 19.4, lat: 57.7679, lon: 40.9268 },
  "Новороссийск": { bortle: 7, sqm: 19.2, lat: 44.7235, lon: 37.7686 },
  "Йошкар-Ола": { bortle: 7, sqm: 19.4, lat: 56.6344, lon: 47.8999 },
  "Комсомольск-на-Амуре": { bortle: 6, sqm: 20.0, lat: 50.5502, lon: 137.0098 },
  "Таганрог": { bortle: 7, sqm: 19.1, lat: 47.2206, lon: 38.9147 },
  "Сыктывкар": { bortle: 6, sqm: 20.3, lat: 61.6688, lon: 50.8357 },
  "Нижневартовск": { bortle: 7, sqm: 19.3, lat: 60.9385, lon: 76.5928 },
  "Нальчик": { bortle: 7, sqm: 19.2, lat: 43.4853, lon: 43.6071 },
  "Шахты": { bortle: 7, sqm: 19.0, lat: 47.7085, lon: 40.2159 },
  "Дзержинск": { bortle: 8, sqm: 18.4, lat: 56.2384, lon: 43.4616 },
  "Орёл": { bortle: 7, sqm: 19.3, lat: 52.9684, lon: 36.0697 },
  "Курган": { bortle: 7, sqm: 19.4, lat: 55.4649, lon: 65.3054 },
  "Мытищи": { bortle: 9, sqm: 17.8, lat: 55.9104, lon: 37.7364 },
  "Химки": { bortle: 9, sqm: 17.7, lat: 55.8888, lon: 37.4304 },
  "Люберцы": { bortle: 9, sqm: 17.6, lat: 55.6865, lon: 37.8981 },
  "Королёв": { bortle: 9, sqm: 17.8, lat: 55.9222, lon: 37.8546 },
  "Подольск": { bortle: 8, sqm: 18.5, lat: 55.4312, lon: 37.5457 },
  "Муром": { bortle: 7, sqm: 19.2, lat: 55.5729, lon: 42.0514 },
  "Серпухов": { bortle: 7, sqm: 19.1, lat: 54.9138, lon: 37.4116 },
  "Коломна": { bortle: 8, sqm: 18.4, lat: 55.0794, lon: 38.7783 },
  "Сергиев Посад": { bortle: 7, sqm: 19.3, lat: 56.3000, lon: 38.1333 },
  "Зеленоград": { bortle: 8, sqm: 18.2, lat: 55.9825, lon: 37.1814 },
  "Пушкино": { bortle: 8, sqm: 18.3, lat: 56.0104, lon: 37.8471 },
  "Жуковский": { bortle: 8, sqm: 18.2, lat: 55.5953, lon: 38.1202 },
  "Домодедово": { bortle: 8, sqm: 18.3, lat: 55.4366, lon: 37.7661 },
  "Раменское": { bortle: 7, sqm: 19.0, lat: 55.5673, lon: 38.2306 },
  "Электросталь": { bortle: 8, sqm: 18.1, lat: 55.7844, lon: 38.4446 },
  "Щёлково": { bortle: 8, sqm: 18.2, lat: 55.9213, lon: 37.9917 },
  "Одинцово": { bortle: 8, sqm: 18.4, lat: 55.6789, lon: 37.2636 },
  "Красногорск": { bortle: 8, sqm: 18.3, lat: 55.8311, lon: 37.3302 },
  "Ногинск": { bortle: 7, sqm: 19.0, lat: 55.8544, lon: 38.4418 },
  "Реутов": { bortle: 9, sqm: 17.5, lat: 55.7612, lon: 37.8625 },
  "Ступино": { bortle: 7, sqm: 19.2, lat: 54.9000, lon: 38.0833 },
  "Дубна": { bortle: 6, sqm: 20.1, lat: 56.7333, lon: 37.1667 },
  "Протвино": { bortle: 5, sqm: 20.6, lat: 54.8667, lon: 37.2167 },
  "Черноголовка": { bortle: 6, sqm: 20.2, lat: 56.0167, lon: 38.3833 },
  "Пущино": { bortle: 5, sqm: 20.7, lat: 54.8333, lon: 37.6167 },
  "Обнинск": { bortle: 6, sqm: 20.0, lat: 55.1000, lon: 36.6167 },
  "Калининец": { bortle: 6, sqm: 20.1, lat: 55.5333, lon: 37.0667 },
  "Снегири": { bortle: 5, sqm: 20.8, lat: 55.8833, lon: 37.0333 },
  "Кубинка": { bortle: 6, sqm: 20.2, lat: 55.5833, lon: 36.2833 },
  "Можайск": { bortle: 6, sqm: 20.3, lat: 55.5000, lon: 36.0333 },
  "Волоколамск": { bortle: 6, sqm: 20.2, lat: 56.0333, lon: 35.9667 },
  "Клин": { bortle: 6, sqm: 20.1, lat: 56.3333, lon: 36.7333 },
  "Солнечногорск": { bortle: 7, sqm: 19.3, lat: 56.1833, lon: 36.9833 },
  "Истра": { bortle: 6, sqm: 20.2, lat: 55.9167, lon: 36.8667 },
  "Наро-Фоминск": { bortle: 6, sqm: 20.1, lat: 55.3833, lon: 36.7333 },
  "Чехов": { bortle: 6, sqm: 20.2, lat: 55.1500, lon: 37.4667 },
  "Серебряные Пруды": { bortle: 4, sqm: 21.2, lat: 54.9667, lon: 38.7333 },
  "Зарайск": { bortle: 5, sqm: 20.5, lat: 54.7500, lon: 38.8833 },
  "Луховицы": { bortle: 5, sqm: 20.6, lat: 54.9667, lon: 39.0333 },
  "Егорьевск": { bortle: 6, sqm: 20.1, lat: 55.3833, lon: 39.0333 },
  "Орехово-Зуево": { bortle: 7, sqm: 19.1, lat: 55.8067, lon: 38.9618 },
  "Куровское": { bortle: 5, sqm: 20.5, lat: 55.5833, lon: 38.9167 },
  "Шатура": { bortle: 5, sqm: 20.6, lat: 55.5833, lon: 39.5333 },
  "Рошаль": { bortle: 6, sqm: 20.0, lat: 55.6667, lon: 39.8667 },
  "Воскресенск": { bortle: 6, sqm: 20.1, lat: 54.6833, lon: 38.6500 },
  "Бронницы": { bortle: 6, sqm: 20.2, lat: 55.4167, lon: 38.2667 },
  "Дедовск": { bortle: 8, sqm: 18.4, lat: 55.8667, lon: 37.1167 },
  "Краснознаменск": { bortle: 6, sqm: 20.1, lat: 55.6000, lon: 37.0333 },
  "Апрелевка": { bortle: 7, sqm: 19.2, lat: 55.5333, lon: 37.0667 },
  "Троицк": { bortle: 6, sqm: 20.2, lat: 55.4833, lon: 37.3000 },
  "Киевский": { bortle: 5, sqm: 20.7, lat: 55.4333, lon: 36.8333 }
};

// Описания для Bortle классов
export const bortleDescriptions = {
  1: { title: "Отличное темное небо", desc: "Зодиакальный свет виден, Млечный Путь бросает тень", color: "#2563eb" },
  2: { title: "Типичное темное небо", desc: "Млечный Путь виден с множеством деталей", color: "#3b82f6" },
  3: { title: "Сельская местность", desc: "Млечный Путь виден, но слабый свет на горизонте", color: "#60a5fa" },
  4: { title: "Пригород/сельская местность", desc: "Млечный Путь слабый, видны основные структуры", color: "#93c5fd" },
  5: { title: "Пригород", desc: "Млечный Путь едва виден, световое загрязнение заметно", color: "#fbbf24" },
  6: { title: "Яркий пригород", desc: "Млечный Путь виден только в зените", color: "#f59e0b" },
  7: { title: "Пригород/город", desc: "Млечный Путь невиден, небо сероватое", color: "#ea580c" },
  8: { title: "Город", desc: "Только яркие звезды видны, небо яркое", color: "#dc2626" },
  9: { title: "Внутригородская", desc: "Почти все звезды невидны, небо оранжевое", color: "#991b1b" }
};

// Формула Хаверсина (км)
export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Генерация исторических данных для графика
export function generateHistoricalData(currentSQM, bortle) {
  const data = [];
  const months = 12;
  
  for (let i = 0; i < months; i++) {
    const month = (new Date().getMonth() - 11 + i + 12) % 12;
    const seasonFactor = month >= 10 || month <= 2 ? 0.3 : -0.2;
    const randomVariation = (Math.random() - 0.5) * 0.4;
    const value = parseFloat(currentSQM) + seasonFactor + randomVariation;
    data.push(Math.max(16, Math.min(22, value)).toFixed(2));
  }
  
  return [{ name: 'SQM', data }];
}

// Оптимизированная функция получения данных
export function getLightPollutionData(lat, lon) {
  let nearestCity = null;
  let minDistance = Infinity;
  
  // Оптимизация: сначала проверяем крупные города (первые 20)
  const majorCities = Object.entries(cityData).slice(0, 20);
  for (const [name, data] of majorCities) {
    const dist = getDistance(lat, lon, data.lat, data.lon);
    if (dist < minDistance) {
      minDistance = dist;
      nearestCity = { name, ...data, distance: dist };
    }
    // Early exit: если нашли город ближе 2км
    if (dist < 2) break;
  }
  
  // Если не нашли близкий крупный город — ищем во всех остальных
  if (minDistance > 50) {
    const otherCities = Object.entries(cityData).slice(20);
    for (const [name, data] of otherCities) {
      const dist = getDistance(lat, lon, data.lat, data.lon);
      if (dist < minDistance) {
        minDistance = dist;
        nearestCity = { name, ...data, distance: dist };
      }
    }
  }
  
  // < 3 км от центра города
  if (minDistance < 3) {
    const factor = Math.max(0, 1 - minDistance / 3);
    const sqm = nearestCity.sqm - (factor * 0.3);
    const bortle = Math.min(9, Math.max(1, nearestCity.bortle + (factor > 0.5 ? 1 : 0)));
    
    return {
      bortle: Math.round(bortle),
      sqm: sqm.toFixed(2),
      source: nearestCity.name,
      sourceType: 'city',
      distance: minDistance.toFixed(1),
      confidence: 'high'
    };
  }
  
  // 3-30 км от города - интерполяция
  if (minDistance < 30) {
    const improvement = Math.log(minDistance / 3) * 0.8;
    let sqm = parseFloat(nearestCity.sqm) + improvement;
    let bortle = nearestCity.bortle - Math.floor(improvement / 0.4);
    
    bortle = Math.max(1, Math.min(9, bortle));
    sqm = Math.min(22.0, Math.max(16.0, sqm));
    
    return {
      bortle,
      sqm: sqm.toFixed(2),
      source: `${minDistance.toFixed(0)} км от ${nearestCity.name}`,
      sourceType: 'suburb',
      distance: minDistance.toFixed(1),
      confidence: 'medium'
    };
  }
  
  // > 30 км от города
  const isRemote = minDistance > 100;
  const isNorth = lat > 60;
  
  let baseSQM = isRemote ? 21.5 : 20.8;
  if (isNorth) baseSQM += 0.3;
  baseSQM += (Math.abs(lat) / 90) * 0.4;
  
  return {
    bortle: isRemote ? 2 : 3,
    sqm: baseSQM.toFixed(2),
    source: isRemote ? "Удаленная местность" : "Сельская местность",
    sourceType: isRemote ? 'remote' : 'rural',
    distance: minDistance.toFixed(0),
    confidence: 'estimate'
  };
}