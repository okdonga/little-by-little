export const LAYER_TYPE = {
  DAILY: "daily",
  CONFIRMED: "confirmed", 
  DEATHS: "deaths",
  RECOVERED: "recovered",
}

export const FILENAME = {
  [LAYER_TYPE.DAILY]: './data/time_series_covid19_daily_global.geojson',
  [LAYER_TYPE.CONFIRMED]: './data/time_series_covid19_confirmed_global.geojson',
  [LAYER_TYPE.DEATHS]: './data/time_series_covid19_deaths_global.geojson'
}
