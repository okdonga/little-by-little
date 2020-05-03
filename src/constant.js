export const LAYER_TYPE = {
  // DAILY: "daily",
  CONFIRMED: "confirmed", 
  DEATHS: "deaths",
  // RECOVERED: "recovered",
}

export const FILENAME = {
  [LAYER_TYPE.DAILY]: './data/time_series_covid19_daily_global.geojson',
  [LAYER_TYPE.CONFIRMED]: './data/time_series_covid19_confirmed_global.geojson',
  [LAYER_TYPE.DEATHS]: './data/time_series_covid19_deaths_global.geojson'
}

export const LEGION_COLORS = {
  PART_1: "#FFA07A",
  PART_2: "#F08080",
  PART_3: "#CD5C5C",
  PART_4: "#DC143C",
  PART_5: "#B22222",
  PART_6: "#FF0000",
}

export const LEGION_RANGE = {
  CASE_1: {
    COUNT_CONFIRMED: 100,
    COUNT_DEATH: 10,
    RADIUS: 5,
  },
  CASE_2: {
    COUNT_CONFIRMED: 12500,
    COUNT_DEATH: 100,
    RADIUS: 20,
  },
  CASE_3: {
    COUNT_CONFIRMED: 50000,
    COUNT_DEATH: 500,
    RADIUS: 30,
  },
  CASE_4: {
    COUNT_CONFIRMED: 200000,
    COUNT_DEATH: 1000,
    RADIUS: 50,
  },
  CASE_5: {
    COUNT_CONFIRMED: 500000,
    COUNT_DEATH: 10000,
    RADIUS: 80,
  },
  CASE_6: {
    COUNT_CONFIRMED: 800000,
    COUNT_DEATH: 70000,
    RADIUS: 100,
  }
}
