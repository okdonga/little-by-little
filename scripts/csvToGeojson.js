const csvToJson = require('csvtojson');
const fs = require('fs')
const input = process.argv[2].toLocaleLowerCase();

const LAYER_TYPE = {
    DAILY: "daily",
    CONFIRMED: "confiremd", 
    DEATHS: "deaths",
    RECOVERED: "recovered",
}

const isValidInput = [LAYER_TYPE.CONFIRMED,LAYER_TYPE.DEATHS,LAYER_TYPE.RECOVERED, LAYER_TYPE.DAILY];

if (isValidInput.indexOf(input) < 0) throw "Parameter must be either confiremd, deaths, recovered or daily";

function fileInfo(input) {
    switch(input) {
        case LAYER_TYPE.DAILY: 
            return {
                in: `./COVID-19/csse_covid_19_data/csse_covid_19_daily_reports/04-22-2020.csv`,
                out: `public/data/time_series_covid19_${input}_global.geojson`
            }
        default: 
            return {
                in: `./COVID-19/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_${input}_global.csv`,
                out: `public/data/time_series_covid19_${input}_global.geojson`
            }
    }
}

function makeGeoJson(features, date, count, row) {
    let params = {
        "type": "Feature",
        "properties": {
            "country_region": row["Country/Region"],
            "province_state": row["Province/State"],
        },
        "geometry": {
            "type": "Point",
            "coordinates": [row['Long'], row['Lat']]
        }
    }

    params['properties']["Date"] = date;
    params['properties'][input] = count

    return params; 
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
  
const processFile = async () => {
    const filename = fileInfo(input);
    let dateRanges = []; 

    const rawData = await csvToJson({
        trim: true,
    })
    .on('header',(header)=>{
        header.forEach((val, idx) => {
            if (idx > 10) {
                dateRanges.push(val);
            }   
        })
    }).fromFile(filename.in);
    const features = []  
    await asyncForEach(rawData, async(row) => {
        if (input === LAYER_TYPE.DAILY) {
            let params = {
                "type": "Feature",
                "properties": {
                    "country_region": row["Country_Region"],
                    "province_state": row["Province_State"],
                    "confirmed": +row["Confirmed"],
                    "deaths": +row["Deaths"],
                    "recovered": +row["Recovered"],
                    "active": +row["Active"],
                    "Date": "04-22-2020",
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [row['Long_'], row['Lat']]
                }
            }
            
            features.push(params);
        } else {
            await asyncForEach(dateRanges, async (date) => {
                try {
                  const count = +row[date]
                  if (count > 0) {
                    const res = await makeGeoJson(features,  date, count, row)
                    features.push({...res})
                  }
                } catch(err) {
                    console.log(err)
                }
            })       
        }
    });

    const geojsonOutput = { "type": "FeatureCollection", features }
    fs.writeFileSync(filename.out, JSON.stringify(geojsonOutput), 'utf8')
};


processFile();
